import init, { ChunksConfiguration, secure_message, identify } from 'icod-crypto-js';

export type SecureMessageResult = {
  encryptedMessage: string[];
  chunks: string[];
};

export type IdentificationResult = MessagePart | Chunk;

// TODO [ToDr] find a way to avoid duplicating this stuff here and in crypto-js.
export type MessagePart = {
  version: number;
  part_index: number;
  parts_total: number;
  nonce: string | null;
  data: string;
};

export type Chunk = {
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

  public async secureMessage(
    message: string,
    { required, spare }: { required: number; spare: number },
  ): Promise<SecureMessageResult> {
    const chunks = new ChunksConfiguration(required, spare);
    const res = await secure_message(message, 368, chunks);

    return {
      chunks: res.chunks as string[],
      encryptedMessage: res.encrypted_message as string[],
    };
  }

  public async identify(text: string): Promise<IdentificationResult> {
    // we always pass the text as lower case to rust
    return await identify(text.toLowerCase());
  }
}
