import { useCallback, useState } from 'react';
import { Chunk, ChunksConfiguration, Crypto } from '../services/crypto';

export type RichSecureMessageResult = {
  encryptedMessage: string[];
  chunks: Chunk[];
};

export function useSecureMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState<RichSecureMessageResult | null>(null);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, [setResult, setError]);

  const secureMessage = useCallback(
    async (value: string, configuration: ChunksConfiguration) => {
      setError(null);
      setIsLoading(true);
      console.log('Call into Rust with', value, configuration);

      try {
        try {
          const crypto = await Crypto.initialize();
          const result_1 = await crypto.secureMessage(value, configuration);
          const { chunks, encryptedMessage } = result_1;
          const identifiedChunks = await Promise.all(chunks.map((c) => crypto.identify(c)));
          const result = {
            chunks: identifiedChunks.filter((c) => c.chunk).map((c) => c.chunk as Chunk),
            encryptedMessage: encryptedMessage,
          };
          setResult(result);
          return result;
        } catch (e: any) {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [setIsLoading, setResult, setError],
  );

  return {
    secureMessage,
    error,
    result,
    clear,
    isLoading,
  };
}
