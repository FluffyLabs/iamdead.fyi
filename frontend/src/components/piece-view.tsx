import { Heading, KeyIcon, Tooltip, majorScale } from 'evergreen-ui';
import { Row } from './row';
import { ReactNode } from 'react';
import { Chunk } from '../services/crypto';

export type ChunksMeta = {
  description: string;
  chunk: Chunk;
};

export const PieceView = ({ chunk, children }: { chunk: ChunksMeta; children: ReactNode }) => {
  const total = chunk.chunk.requiredChunks + chunk.chunk.spareChunks;
  return (
    <Row>
      <Tooltip content={`${chunk.chunk.chunkIndex + 1}/${total}`}>
        <KeyIcon size={majorScale(5)} />
      </Tooltip>
      <Heading
        size={400}
        marginLeft={majorScale(2)}
      >
        {chunk.chunk.name}
      </Heading>
      {children}
    </Row>
  );
};
