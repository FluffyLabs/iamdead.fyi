import init, { ChunksConfiguration, secure_message } from 'icod-crypto-js';

export type SecureMessageResult = {
  encryptedMessage: string[];
  chunks: string[];
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
}
