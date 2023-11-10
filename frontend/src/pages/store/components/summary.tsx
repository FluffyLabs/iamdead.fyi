import {
  Alert,
  Heading,
  KeyIcon,
  LockIcon,
  Pane,
  majorScale,
  Paragraph,
  CaretRightIcon,
  CrossIcon,
} from 'evergreen-ui';
import { ChunkStorage } from '../store';
import { ConfiguredAdapter } from '../services/adapters';
import { Slab } from '../../../components/slab';
import { ReactNode, useMemo } from 'react';
import React from 'react';

const Box = ({ children, width }: { children: ReactNode; width?: string }) => (
  <Pane
    alignItems="center"
    display="flex"
    flexDirection="column"
    flexGrow={0}
    margin={majorScale(2)}
    textAlign="center"
    width={width}
  >
    {children}
  </Pane>
);

const Box2 = ({ children }: { children: ReactNode }) => (
  <Pane
    display="flex"
    alignItems="center"
    justifyItems="flex-start"
    marginY={majorScale(4)}
  >
    {children}
  </Pane>
);

const ChunkIcon = ({ index, name, isPhantom }: { index: number; name: string; isPhantom?: boolean }) => (
  <Box>
    {isPhantom ? (
      <CrossIcon
        size={30}
        color="#c0c0c0"
      />
    ) : (
      <KeyIcon size={30} />
    )}
    <Heading
      size={300}
      marginTop={majorScale(1)}
      textDecoration={isPhantom ? 'line-through' : undefined}
      color={isPhantom ? '#c0c0c0' : undefined}
    >
      {name}
    </Heading>
  </Box>
);

type Props = {
  listOfAdapters: ConfiguredAdapter[][];
  gracePeriod: number;
  chunks: ChunkStorage[];
};

export const Summary = ({ listOfAdapters, gracePeriod, chunks }: Props) => {
  const requiredPieces = chunks[0]?.chunk?.requiredChunks || 0;
  const sparePieces = chunks[0]?.chunk?.spareChunks || 0;

  const isStorageSafe = requiredPieces > chunks.length;

  const phantomChunks = useMemo(() => {
    const total = sparePieces + requiredPieces;
    const phantomPieces = Array(total || 0)
      .fill(null)
      .map((_x, index) => {
        return {
          index,
          name: `Restoration Piece ${index + 1}/${total}`,
        };
      });

    return phantomPieces.filter((x) => chunks.findIndex((y) => y.chunk.chunkIndex === x.index) === -1);
  }, [requiredPieces, sparePieces, chunks]);

  if (requiredPieces === 0 || listOfAdapters.length === 0) {
    return (
      <Alert
        intent="danger"
        title="Did you skip the step?"
      >
        <Paragraph>
          Seems that you've skipped a few steps :) Please go back and pick at least one piece and configure at least one
          Proof of Life method.
        </Paragraph>
      </Alert>
    );
  }

  return (
    <>
      <Heading size={500}>What are we going to store?</Heading>
      <Slab
        background="tint2"
        display="flex"
        flexWrap="wrap"
        marginBottom={majorScale(1)}
      >
        <Box>
          <LockIcon size={30} />
          <Heading
            size={300}
            marginTop={majorScale(1)}
          >
            Encrypted Message
          </Heading>
        </Box>
        {chunks.map((chunk) => (
          <ChunkIcon
            key={chunk.chunk.chunkIndex}
            index={chunk.chunk.chunkIndex}
            name={chunk.chunk.name}
          />
        ))}
        {phantomChunks.map((chunk) => (
          <ChunkIcon
            key={chunk.index}
            index={chunk.index}
            name={chunk.name}
            isPhantom
          />
        ))}
      </Slab>
      <Alert
        marginTop={majorScale(2)}
        marginBottom={majorScale(3)}
        flexBasis="100%"
        flex={1}
        intent={isStorageSafe ? 'success' : 'danger'}
        title={
          isStorageSafe
            ? `Storing only ${chunks.length} out of ${requiredPieces} required restoration ${pieces(
                requiredPieces,
              )} DOES NOT let us restore the message.`
            : requiredPieces === 1
            ? `Since you only require 1 restoration piece to read the message we will be able to read the original message!`
            : `You are storing more than ${requiredPieces - 1} restoration ${pieces(
                requiredPieces - 1,
              )}. This is unsafe and allows us to read the original message!`
        }
      />

      <Heading
        size={500}
        marginTop={majorScale(5)}
      >
        When will this data be shared?
      </Heading>
      <Slab
        background="tint2"
        display="flex"
        flexWrap="wrap"
      >
        <Pane flex="2">
          {listOfAdapters.map((group, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <Paragraph marginY={majorScale(1)}>and</Paragraph>}

              <Heading
                size={300}
                key={idx}
                marginLeft={majorScale(1)}
              >
                {group.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && ' or '}
                    {item.icon} {item.name} inactive for {item.months} {months(item.months)}
                  </React.Fragment>
                ))}
              </Heading>
            </React.Fragment>
          ))}
          <Paragraph marginY={majorScale(1)}>followed by</Paragraph>
          <Heading
            size={300}
            marginLeft={majorScale(1)}
          >
            grace period of <strong>{gracePeriod}</strong> {months(gracePeriod)}
          </Heading>
        </Pane>
        <Pane flex="1">
          <Paragraph>Configuring the accounts will be possible after signing in.</Paragraph>
        </Pane>
      </Slab>

      <Heading
        size={500}
        marginTop={majorScale(5)}
      >
        With whom will that data be shared?
      </Heading>
      <Slab background="tint2">
        <Box2>
          <Box width="130px">
            <LockIcon size={30} />
            <Heading
              size={300}
              marginTop={majorScale(1)}
            >
              Encrypted Message
            </Heading>
          </Box>
          <CaretRightIcon
            size={50}
            flexShrink={0}
          />
          <Paragraph>every recipient</Paragraph>
        </Box2>
        {chunks.map((chunk) => (
          <Box2 key={chunk.chunk.chunkIndex}>
            <Box width="130px">
              <KeyIcon size={30} />
              <Heading
                size={300}
                marginTop={majorScale(1)}
              >
                {chunk.chunk.name}
              </Heading>
            </Box>
            <CaretRightIcon
              size={50}
              flexShrink={0}
            />
            <Paragraph>{chunk.recipient?.toString()}</Paragraph>
          </Box2>
        ))}
      </Slab>
      <Alert
        intent={requiredPieces > 1 ? 'none' : 'warning'}
        title={
          requiredPieces > 1
            ? `Note that a single restoration piece is not enough to read the encrypted message.
               Your encryption configuration requires at least ${requiredPieces} ${pieces(requiredPieces)}
               to be used together to restore the message.`
            : `With your configuration even a single piece is enough to restore the message, so each recipient will be able to read the original message on their own.`
        }
      />
    </>
  );
};

function months(num: number) {
  return num === 1 ? 'month' : 'months';
}

function pieces(num: number) {
  return num === 1 ? 'piece' : 'pieces';
}
