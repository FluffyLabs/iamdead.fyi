import init, {
  ChunksConfiguration as RustChunksConfiguration,
  secure_message,
  identify,
  restore_message,
  alter_chunks_name,
} from 'icod-crypto-js';

export type SecureMessageResult = {
  encryptedMessage: string[];
  chunks: string[];
};

export type IdentificationResult = {
  messagePart?: MessagePart;
  chunk?: Chunk;
};

export type MessagePart = {
  version: number;
  partIndex: number;
  partsTotal: number;
  nonce: string | null;
  data: string;
  raw: string;
};

// TODO [ToDr] find a way to avoid duplicating this stuff here and in crypto-js.
type MessagePartRust = {
  version: number;
  part_index: number;
  parts_total: number;
  nonce: string | null;
  data: string;
};

export type Chunk = {
  name: string;
  version: number;
  keyHash: string;
  requiredChunks: number;
  spareChunks: number;
  chunkIndex: number;
  data: string;
  raw: string;
};

export type ChunksConfiguration = {
  required: number;
  spare: number;
};

type ChunkRust = {
  name: string;
  version: number;
  key_hash: string;
  required_chunks: number;
  spare_chunks: number;
  chunk_index: number;
  data: string;
};

export class Crypto {
  static async initialize() {
    return init().then(() => new Crypto());
  }

  public async secureMessage(message: string, { required, spare }: ChunksConfiguration): Promise<SecureMessageResult> {
    const chunks = new RustChunksConfiguration(required, spare);
    const res = await secure_message(message, 368, chunks);

    return {
      chunks: res.chunks as string[],
      encryptedMessage: res.encrypted_message as string[],
    };
  }

  public async restoreMessage(messageParts: MessagePart[], chunks: Chunk[]): Promise<string> {
    const message = messageParts.map((chunk) => chunk.raw);
    const chunks2 = chunks.map((chunk) => chunk.raw);

    const result = await (restore_message(message, chunks2) as any as Promise<string>);
    return result;
  }

  public async alterChunksName(text: string, newName: string): Promise<string> {
    return await alter_chunks_name(text, newName);
  }

  public async identify(text: string): Promise<IdentificationResult> {
    const raw = text.toLowerCase();
    // we always pass the text as lower case to rust
    const id = await identify(raw);

    if (id.MessagePart) {
      const { version, part_index, parts_total, nonce, data } = id.MessagePart as MessagePartRust;
      return {
        messagePart: {
          version,
          partIndex: part_index,
          partsTotal: parts_total,
          nonce,
          data,
          raw,
        },
      };
    }

    if (id.Chunk) {
      const { name, version, key_hash, required_chunks, spare_chunks, chunk_index, data } = id.Chunk as ChunkRust;
      return {
        chunk: {
          name,
          version,
          keyHash: key_hash,
          requiredChunks: required_chunks,
          spareChunks: spare_chunks,
          chunkIndex: chunk_index,
          data,
          raw,
        },
      };
    }

    return {};
  }
}
