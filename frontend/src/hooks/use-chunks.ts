import { useState } from 'react';
import { Chunk } from '../services/crypto';

export type ChunksMeta = {
  description: string;
  chunk: Chunk;
};

export function useChunks<T extends ChunksMeta>(initialChunks: T[]) {
  const [chunks, setChunks] = useState(initialChunks);

  return {
    chunks,
    setChunks,
  };
}
