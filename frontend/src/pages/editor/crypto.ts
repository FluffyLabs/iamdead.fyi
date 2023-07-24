import init, { ChunksConfiguration, secure_message } from 'icod-crypto-js';

export type SecureMessageResult = {
  encryptedMessage: {
    data: string;
    nonce: string;
  };
  chunks: [string];
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
    const response = secure_message(message, chunks);
    const res = await response;

    return {
      chunks: res.chunks as [string],
      encryptedMessage: {
        data: u8ArrayToHex(res.encrypted_message.data),
        nonce: u8ArrayToHex(res.encrypted_message.nonce),
      },
    };
  }
}

function u8ArrayToHex(arr: [number]) {
  return arr.map((x) => decimalToHex(x, 2)).join('');
}

function decimalToHex(decimal: number, chars: number) {
  return (decimal + Math.pow(16, chars))
    .toString(16)
    .slice(-chars)
    .toUpperCase();
}
