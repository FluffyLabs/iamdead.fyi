import { useCallback } from 'react';
import { Chunk, Crypto } from '../services/crypto';

export function useAlterChunkName() {
  const alterChunkName = useCallback(async (chunk: Chunk, newName: string) => {
    if (chunk.name === newName) {
      return chunk;
    }

    const crypto = await Crypto.initialize();
    const newRaw = await crypto.alterChunksName(chunk.raw || '', newName);

    chunk.name = newName;
    chunk.raw = newRaw;

    return {
      ...chunk,
    };
  }, []);

  return alterChunkName;
}
