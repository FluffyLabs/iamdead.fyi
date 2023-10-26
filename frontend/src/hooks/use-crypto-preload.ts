import { useEffect, useState } from 'react';
import { Crypto } from '../services/crypto';

export function useCryptoPreload() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Crypto.initialize().then(() => {
      setIsLoaded(true);
    });
  }, [setIsLoaded]);

  return isLoaded;
}
