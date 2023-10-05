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
    (value: string, configuration: ChunksConfiguration) => {
      setError(null);
      setIsLoading(true);
      console.log('Call into Rust with', value, configuration);
      Crypto.initialize()
        .then((crypto) => {
          return crypto.secureMessage(value, configuration);
        })
        .then((result) => {
          setResult(result);
          console.log(result.chunks);
          console.log(result.encryptedMessage);
        })
        .catch((e) => {
          setError(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
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
