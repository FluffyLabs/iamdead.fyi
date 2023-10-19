import { Heading, KeyIcon, majorScale } from 'evergreen-ui';
import { Row } from './row';
import { ReactNode } from 'react';

export type ChunksMeta = {
  name: string;
  description: string;
  value: string;
};

export const PieceView = ({
  chunk,
  index,
  total,
  children,
}: {
  chunk: ChunksMeta;
  index: number;
  total: number;
  children: ReactNode;
}) => {
  return (
    <Row>
      <KeyIcon size={majorScale(5)} />
      <Heading
        size={400}
        marginLeft={majorScale(2)}
      >
        {index + 1}/{total}
      </Heading>
      <Heading
        size={400}
        marginLeft={majorScale(2)}
      >
        {chunk.name}
      </Heading>
      {children}
    </Row>
  );
};
