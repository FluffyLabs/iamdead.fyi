import { Heading, KeyIcon, Pane, Tooltip, majorScale } from 'evergreen-ui';
import { Row } from './row';
import { ReactNode } from 'react';
import { ChunksMeta } from '../hooks/use-chunks';

type Props = {
  chunk: ChunksMeta;
  children: ReactNode;
  firstLine?: ReactNode;
  appendix?: ReactNode;
};

export const PieceView = ({ chunk, children, firstLine, appendix }: Props) => {
  const total = chunk.chunk.requiredChunks + chunk.chunk.spareChunks;
  return (
    <Row>
      <Tooltip content={`${chunk.chunk.chunkIndex + 1}/${total}`}>
        <KeyIcon
          size={majorScale(5)}
          flexShrink="0"
        />
      </Tooltip>
      <Pane
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        flex="1"
      >
        <Pane
          display="flex"
          alignItems="center"
          flexShrink="0"
        >
          <Heading
            size={400}
            marginLeft={majorScale(2)}
            marginBottom={majorScale(1)}
          >
            {chunk.chunk.name}
            {firstLine}
          </Heading>
        </Pane>
        {children}
      </Pane>
      {appendix && (
        <Pane
          justifySelf="flex-end"
          flex="0"
        >
          {appendix}
        </Pane>
      )}
    </Row>
  );
};
