import { Chunk, Crypto, MessagePart } from './crypto';
import { isEqual } from 'lodash';

export interface ChunkWrapper {
  chunk: Chunk;
}

export interface ChunkWrapperConstructor<T extends ChunkWrapper> {
  (a0: Chunk): T;
}

export class PartsCollector<T extends ChunkWrapper> {
  ctor: ChunkWrapperConstructor<T>;
  crypto: Promise<Crypto | void>;

  constructor(ctor: ChunkWrapperConstructor<T>, setError: (e: string) => void) {
    this.ctor = ctor;
    this.crypto = Crypto.initialize().catch((err: Error) => {
      console.error(err);
      setError(err.message);
    });
  }

  async handlePart(messageParts: MessagePart[], chunks: T[], part: string) {
    const crypto = await this.getCrypto();
    let id;
    try {
      id = await crypto.identify(part);
    } catch (e: any) {
      if (typeof e === 'string') {
        throw new Error(e);
      } else {
        throw e;
      }
    }
    const { messagePart, chunk } = id;

    if (messagePart) {
      return {
        messageParts: this.addMessage(messageParts, messagePart),
        chunks,
      };
    }

    if (chunk) {
      return {
        chunks: this.addChunk(chunks, chunk),
        messageParts,
      };
    }

    throw new Error('Undetected part type.');
  }

  async restoreMessage(messageParts: MessagePart[], chunks: Chunk[]) {
    const crypto = await this.getCrypto();
    try {
      const restored = await crypto.restoreMessage(messageParts, chunks);
      return restored;
    } catch (e: any) {
      if (typeof e === 'string') {
        throw new Error(e);
      } else {
        throw e;
      }
    }
  }

  addChunk(chunks: T[], chunk: Chunk) {
    // happy case :)
    if (chunks.length === 0) {
      return [this.ctor(chunk)];
    }
    // check duplicate
    if (chunks.find((p) => isEqual(p.chunk, chunk))) {
      throw new Error('Duplicated chunk.');
    }
    // check if it matches the ones we already have
    const { version, requiredChunks, spareChunks, keyHash } = chunks[0].chunk;
    if (keyHash !== chunk.keyHash) {
      throw new Error('This chunk is for a different key.');
    }
    if (version !== chunk.version) {
      throw new Error('Version mismatch.');
    }
    if (requiredChunks !== chunk.requiredChunks || spareChunks !== chunk.spareChunks) {
      throw new Error('Chunk configuration mismatch.');
    }

    const chunkWrapper = this.ctor(chunk);
    return this.insertAtLocation(chunks, chunkWrapper, (x) => x.chunk.chunkIndex);
  }

  addMessage(parts: MessagePart[], messagePart: MessagePart) {
    // happy case :)
    if (parts.length === 0) {
      return [messagePart];
    }
    // first validate if it's a duplicate
    if (parts.find((p) => isEqual(p, messagePart))) {
      throw new Error('Duplicated message part.');
    }
    // check if it matches the ones we already have
    const { version, partsTotal } = parts[0];
    if (version !== messagePart.version) {
      throw new Error('Version mismatch.');
    }
    if (partsTotal !== messagePart.partsTotal) {
      throw new Error('Mismatching number of total parts.');
    }

    return this.insertAtLocation(parts, messagePart, (x) => x.partIndex);
  }

  insertAtLocation<T, X>(destination: T[], elem: T, extract: (arg0: T) => X) {
    // find a spot where to add the parts.
    const value = extract(elem);
    const destinationIndex = destination.findIndex((x) => extract(x) > value);
    if (destinationIndex === -1) {
      return [...destination, elem];
    }

    destination.splice(destinationIndex, 0, elem);
    return [...destination];
  }

  public static howManyChunksMissing(chunks: Chunk[]) {
    if (chunks.length === 0) {
      return null;
    }
    const chunk = chunks[0];
    return Math.max(0, chunk.requiredChunks - chunks.length);
  }

  public static howManyMessagePartsMissing(parts: MessagePart[]) {
    if (parts.length === 0) {
      return null;
    }
    const p = parts[0];
    return p.partsTotal - parts.length;
  }

  async getCrypto() {
    const c = await this.crypto;
    if (!c) {
      throw new Error('Could not initialize crypto object.');
    }
    return c;
  }
}
