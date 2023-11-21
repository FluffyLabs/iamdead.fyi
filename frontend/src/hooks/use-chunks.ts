import { useCallback, useState } from 'react';
import { Chunk } from '../services/crypto';
import { useAlterChunkName } from './use-alter-chunk-name';

export type ChunksMeta = {
  description: string;
  chunk: Chunk;
};

export type ChunksApi<T extends ChunksMeta> = ReturnType<typeof useChunks<T>>;

export function useChunks<T extends ChunksMeta>(initialChunks: T[]) {
  const [chunks, setChunks] = useState(initialChunks);
  const alterChunkName = useAlterChunkName();

  const discardChunk = useCallback(
    (chunk: T) => {
      if (
        window.confirm(
          'The piece is going to be removed from the list. The operation is irreversible so make sure you have a copy.',
        )
      ) {
        const idx = chunks.indexOf(chunk);
        if (idx !== -1) {
          chunks.splice(idx, 1);
          setChunks([...chunks]);
        }
      }
    },
    [chunks, setChunks],
  );

  const changeName = useCallback(
    async (chunk: T, newName: string) => {
      if (chunk.chunk.name === newName) {
        return null;
      }

      try {
        const idx = chunks.indexOf(chunk);
        if (idx !== -1) {
          const newChunk = await alterChunkName(chunk.chunk, newName);
          chunks[idx] = {
            ...chunk,
            chunk: newChunk,
          };
          setChunks([...chunks]);
        }
        return null;
      } catch (e) {
        return `${e}`;
      }
    },
    [alterChunkName, chunks],
  );

  const changeDescription = useCallback(
    (chunk: T, newDescription: string) => {
      const idx = chunks.indexOf(chunk);
      if (idx !== -1) {
        chunks[idx] = {
          ...chunk,
          description: newDescription,
        };
        setChunks([...chunks]);
      }
    },
    [chunks, setChunks],
  );

  return {
    chunks,
    setChunks,
    discardChunk,
    changeName,
    changeDescription,
  };
}
