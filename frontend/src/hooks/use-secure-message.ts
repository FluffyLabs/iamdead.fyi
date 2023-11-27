import { useCallback, useState } from 'react';
import { Chunk, ChunksConfiguration, Crypto } from '../services/crypto';

export type RichSecureMessageResult = {
  encryptedMessage: string[];
  chunks: Chunk[];
};

export type SecureMessageApi = ReturnType<typeof useSecureMessage>;

export function useSecureMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState<RichSecureMessageResult | null>(null);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, [setResult, setError]);

  const secureMessage = useCallback(
    async (message: string, configuration: ChunksConfiguration, userDefinedNames: string[]) => {
      setError(null);
      setIsLoading(true);
      console.log('Call into Rust with', message, configuration);

      try {
        try {
          const crypto = await Crypto.initialize();
          const result_1 = await crypto.secureMessage(message, configuration);
          const { chunks, encryptedMessage } = result_1;
          const identifiedChunks = await Promise.all(chunks.map((c) => crypto.identify(c)));
          const onlyChunks = identifiedChunks.filter((c) => c.chunk).map((c) => c.chunk as Chunk);

          await Promise.all(
            userDefinedNames.map(async (name, idx) => {
              if (onlyChunks.length > idx && name) {
                const raw = await crypto.alterChunksName(onlyChunks[idx].raw, name);
                onlyChunks[idx].name = name;
                onlyChunks[idx].raw = raw;
              }
            }),
          );

          const result = {
            chunks: onlyChunks,
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
