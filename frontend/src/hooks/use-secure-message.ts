import { useCallback, useState } from 'react';
import { ChunksConfiguration, Crypto, SecureMessageResult } from '../services/crypto';

export function useSecureMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState<SecureMessageResult | null>(null);

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
          setResult(result_1);
          console.log(result_1.chunks);
          console.log(result_1.encryptedMessage);
          return result_1;
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
