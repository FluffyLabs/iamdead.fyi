import { Alert, Button, Dialog, Group, Heading, Pane, Paragraph, Tooltip, majorScale, toaster } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PartsCollector } from '../../services/parts-collector';
import { Chunk, MessagePart } from '../../services/crypto';
import { ImportMethods } from './components/import-methods';
import { EncryptedMessageView, encryptedMessageBytes } from '../../components/encrypted-message-view';
import { PieceView } from '../../components/piece-view';
import { NextStepButton } from '../../components/next-step-button';
import { useLocation, useNavigate } from 'react-router-dom';
import { State } from '../store/store';
import { MessageEditor } from '../../components/message-editor';
import { PieceOptions } from '../../components/piece-options';
import { ChunksApi, ChunksMeta, useChunks } from '../../hooks/use-chunks';

export const Scan = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Import the encrypted message and restoration pieces.
        </Heading>
        <Import />
      </Container>
    </>
  );
};

const Import = () => {
  const { state }: { state: State | null } = useLocation();
  const navigate = useNavigate();

  const [initializedFromState, setInitializedFromState] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [messageParts, setMessageParts] = useState([] as MessagePart[]);
  const chunksApi = useChunks(state?.encryptionResult.chunks || []);
  const { chunks, setChunks } = chunksApi;
  const [lastPart, setLastPart] = useState(null as string | null);

  const partsCollector = useMemo(
    () =>
      new PartsCollector(
        (chunk: Chunk) =>
          ({
            chunk,
            description: '',
          }) as ChunksMeta,
        setError,
      ),
    [],
  );

  // import initial message parts
  useEffect(() => {
    async function doImport(encryptedMessage: string[]) {
      let newMessageParts = [] as MessagePart[];
      for (let part of encryptedMessage) {
        const res = await partsCollector.handlePart(newMessageParts, chunks, part);
        newMessageParts = res.messageParts;
      }
      setMessageParts(newMessageParts);
    }
    const existingMessage = state?.encryptionResult.encryptedMessageRaw;
    if (existingMessage && !initializedFromState) {
      doImport(existingMessage).catch((e: Error) => {
        setError(e.message);
        console.error(e);
      });
    }
    setInitializedFromState(true);
    // remove everything from the state
    navigate('.', { replace: true });
  }, [initializedFromState, setInitializedFromState, state, setMessageParts, chunks, partsCollector, navigate]);

  const handleImport = useCallback(
    (err: Error | null, input: string | null) => {
      if (err) {
        console.error(err);
        setError(err.message);
        return;
      }

      if (!input) {
        console.warn('onImport callback with no error nor input');
        return;
      }

      if (input === lastPart) {
        console.log('Got the same part again. Ignoring');
        return;
      }

      setError(null);
      setLastPart(input);

      async function doImport(input: string) {
        let newChunks = chunks;
        let newMessageParts = messageParts;

        for (let part of input.split('\n')) {
          if (!part) continue;
          const res = await partsCollector.handlePart(newMessageParts, newChunks, part);
          const newChunk = chunks.length !== res.chunks.length;
          toaster.success(newChunk ? 'Piece imported successfuly.' : 'Message Part imported successfuly.');
          newMessageParts = res.messageParts;
          newChunks = res.chunks;
        }

        // append descriptions
        setChunks(newChunks);
        setMessageParts(newMessageParts);
        return true;
      }

      doImport(input).catch((e: Error) => {
        setError(e.message);
        console.error(e);
      });
    },
    [setError, setChunks, setMessageParts, setLastPart, lastPart, partsCollector, messageParts, chunks],
  );

  const justChunks = useMemo(() => chunks.map((c) => c.chunk), [chunks]);

  return (
    <>
      <Paragraph>
        Drag &amp; drop the restoration pieces and encrypted message or scan QR codes from an offline device.
      </Paragraph>
      <Pane
        marginY={majorScale(2)}
        display="flex"
        flexWrap="wrap"
      >
        <ImportMethods
          onImport={handleImport}
          error={error}
        />
      </Pane>
      {error && <Alert intent="danger">{error}</Alert>}
      <DisplayResults
        messageParts={messageParts}
        chunksApi={chunksApi}
      />
      <Restore
        messageParts={messageParts}
        chunks={justChunks}
        partsCollector={partsCollector}
      />
    </>
  );
};

const DisplayResults = ({
  messageParts,
  chunksApi,
}: {
  messageParts: MessagePart[];
  chunksApi: ChunksApi<ChunksMeta>;
}) => {
  const { chunks } = chunksApi;
  const messagePartsAvailable = messageParts.length;
  const messagePartsTotal = messageParts[0]?.partsTotal || 0;
  const messageBytes = messageParts.length > 0 ? encryptedMessageBytes(messageParts.map((x) => x.data)) : '???';

  const notEnoughMessageParts = messagePartsAvailable < messagePartsTotal || messagePartsAvailable === 0;
  const notEnoughChunks = chunks.length === 0;

  const navigate = useNavigate();
  const handleNextStep = useCallback(() => {
    const chunksConfiguration = {
      required: chunks[0].chunk.requiredChunks,
      spare: chunks[0].chunk.spareChunks,
    };
    const encryptedMessageRaw = messageParts.map((x) => x.raw);
    const encryptionResult = {
      encryptedMessageRaw,
      encryptedMessageBytes: encryptedMessageBytes(encryptedMessageRaw),
      chunks,
    };

    navigate('/store', {
      state: {
        chunksConfiguration,
        encryptionResult,
      } as State,
    });
  }, [messageParts, chunks, navigate]);

  return (
    <>
      <EncryptedMessageView messageBytes={messageBytes}>
        {!!messagePartsAvailable && (
          <Pane
            display="flex"
            justifyContent="flex-end"
            flex="1"
          >
            <MessageProgress
              values={messageParts.map((x) => x.partIndex)}
              max={messagePartsTotal}
            />
            <Heading size={400}>
              {messagePartsAvailable}/{messagePartsTotal}
            </Heading>
          </Pane>
        )}
      </EncryptedMessageView>
      {chunks.map((chunk) => (
        <ChunkView
          key={chunk.chunk.chunkIndex}
          chunk={chunk}
          onRemoveChunk={chunksApi.discardChunk}
          onNameChange={chunksApi.changeName}
          onDescriptionChange={chunksApi.changeDescription}
        />
      ))}

      <NextStepButton
        disabled={notEnoughMessageParts || notEnoughChunks}
        nextStep={handleNextStep}
      >
        Store restoration pieces & configure distribution
      </NextStepButton>
    </>
  );
};

const ChunkView = ({
  chunk,
  onRemoveChunk,
  onNameChange,
  onDescriptionChange,
}: {
  chunk: ChunksMeta;
  onRemoveChunk: (a0: ChunksMeta) => void;
  onNameChange: (a0: ChunksMeta, a1: string) => Promise<string | null>;
  onDescriptionChange: (a0: ChunksMeta, a1: string) => void;
}) => {
  return (
    <PieceView chunk={chunk}>
      <Pane flex="1"></Pane>
      <PieceOptions
        chunk={chunk}
        onDiscard={onRemoveChunk}
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
    </PieceView>
  );
};

const MessageProgress = ({ values, max }: { values: number[]; max: number }) => {
  const progress = useMemo(() => {
    const progress = Array(max).fill(false);
    values.forEach((x) => (progress[x] = true));
    return progress;
  }, [values, max]);

  return (
    <Group marginX={majorScale(3)}>
      {progress.map((v, idx) => (
        <Tooltip
          content={`Part ${idx + 1}`}
          key={idx}
        >
          <Button
            height="30px"
            width="30px"
            background={!v ? '#FFADAD' : '#A8E6CF'}
          ></Button>
        </Tooltip>
      ))}
    </Group>
  );
};

const Restore = ({
  messageParts,
  chunks,
  partsCollector,
}: {
  messageParts: MessagePart[];
  chunks: Chunk[];
  partsCollector: PartsCollector<ChunksMeta>;
}) => {
  const hasAllMessageParts = messageParts.length === messageParts[0]?.partsTotal;
  const hasEnoughChunks = chunks.length >= chunks[0]?.requiredChunks;

  const [isShowingMessage, setIsShowingMessage] = useState(false);
  const [originalMessage, setOriginalMessage] = useState('');
  const [error, setError] = useState('');

  const clearResults = useCallback(() => {
    setIsShowingMessage(false);
    setOriginalMessage('');
    setError('');
  }, []);

  const handleClick = useCallback(() => {
    partsCollector
      .restoreMessage(messageParts, chunks)
      .then((res) => {
        setIsShowingMessage(true);
        setOriginalMessage(res);
      })
      .catch((e: Error) => {
        console.error(e);
        setIsShowingMessage(true);
        setError(e.message);
      });
  }, [partsCollector, messageParts, chunks]);

  if (!(hasAllMessageParts && hasEnoughChunks)) {
    return null;
  }

  return (
    <>
      <Dialog
        isShown={isShowingMessage}
        title="Restored message"
        onCloseComplete={clearResults}
        hasCancel={false}
        confirmLabel="Done"
      >
        {error ? (
          <Alert
            title="Restoration error"
            intent="danger"
          >
            {error}
          </Alert>
        ) : (
          <MessageEditor
            value={originalMessage}
            readOnly
          />
        )}
      </Dialog>
      <Alert
        marginTop={majorScale(5)}
        intent="success"
        title="You can read the message now."
      >
        <Paragraph marginY={majorScale(2)}>
          You've uploaded the encrypted message and enough pieces to restore the original message. Click the button
          below to decrypt and view the message.
        </Paragraph>
        <Pane
          display="flex"
          justifyContent="center"
        >
          <Button onClick={handleClick}>Restore the message</Button>
        </Pane>
      </Alert>
    </>
  );
};
