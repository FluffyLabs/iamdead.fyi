import {
  Alert,
  Button,
  Dialog,
  Group,
  Heading,
  IconButton,
  Pane,
  Paragraph,
  Tooltip,
  TrashIcon,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useCallback, useMemo, useState } from 'react';
import { PartsCollector } from '../../services/parts-collector';
import { Chunk, MessagePart } from '../../services/crypto';
import { ImportMethods } from './components/import-methods';
import { EncryptedMessageView, encryptedMessageBytes } from '../../components/encrypted-message-view';
import { PieceView } from '../../components/piece-view';
import { NextStepButton } from '../../components/next-step-button';
import { useNavigate } from 'react-router-dom';
import { State } from '../store/store';
import { MessageEditor } from '../../components/message-editor';

export const Scan = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Import the encrypted message and pieces.
        </Heading>
        <Import />
      </Container>
    </>
  );
};

const Import = () => {
  const [error, setError] = useState(null as string | null);
  const [messageParts, setMessageParts] = useState([] as MessagePart[]);
  const [chunks, setChunks] = useState([] as Chunk[]);
  const [lastPart, setLastPart] = useState(null as string | null);

  const partsCollector = useMemo(() => new PartsCollector(setError), []);

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

      partsCollector
        .handlePart(messageParts, chunks, input)
        .then((res) => {
          const newChunk = chunks.length !== res.chunks.length;
          toaster.success(newChunk ? 'Piece imported successfuly.' : 'Message Part imported successfuly.');
          setChunks(res.chunks);
          setMessageParts(res.messageParts);
        })
        .catch((e: Error) => {
          setError(e.message);
          console.error(e);
        });
    },
    [setError, setChunks, setMessageParts, setLastPart, lastPart, partsCollector, messageParts, chunks],
  );

  const removeChunk = useCallback(
    (chunk: Chunk) => {
      const idx = chunks.indexOf(chunk);
      if (idx !== -1) {
        chunks.splice(idx, 1);
      }
      setChunks([...chunks]);
    },
    [chunks, setChunks],
  );

  return (
    <>
      <Paragraph>Drag &amp; drop the pieces and encrypted message or scan QR codes from an offline device.</Paragraph>
      <Pane
        marginY={majorScale(2)}
        display="flex"
      >
        <ImportMethods
          onImport={handleImport}
          error={error}
        />
      </Pane>
      {error && <Alert intent="danger">{error}</Alert>}
      <DisplayResults
        messageParts={messageParts}
        chunks={chunks}
        removeChunk={removeChunk}
      />
      <Restore
        messageParts={messageParts}
        chunks={chunks}
        partsCollector={partsCollector}
      />
    </>
  );
};

const DisplayResults = ({
  messageParts,
  chunks,
  removeChunk,
}: {
  messageParts: MessagePart[];
  chunks: Chunk[];
  removeChunk: (a0: Chunk) => void;
}) => {
  const messagePartsAvailable = messageParts.length;
  const messagePartsTotal = messageParts[0]?.partsTotal || 0;
  const messageBytes = messageParts.length > 0 ? encryptedMessageBytes(messageParts.map((x) => x.data)) : '???';

  const notEnoughMessageParts = messagePartsAvailable < messagePartsTotal || messagePartsAvailable === 0;
  const notEnoughChunks = chunks.length === 0;

  const navigate = useNavigate();
  const handleNextStep = useCallback(() => {
    const chunksConfiguration = {
      required: chunks[0].requiredChunks,
      spare: chunks[0].spareChunks,
    };
    const encryptedMessage = messageParts.map((x) => x.data);
    const encryptionResult = {
      encryptedMessage,
      encryptedMessageBytes: encryptedMessageBytes(encryptedMessage),
      chunks: chunks.map(chunkToMeta),
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
          key={chunk.chunkIndex}
          chunk={chunk}
          removeChunk={removeChunk}
        />
      ))}

      <NextStepButton
        disabled={notEnoughMessageParts || notEnoughChunks}
        nextStep={handleNextStep}
      >
        Store pieces & configure distribution
      </NextStepButton>
    </>
  );
};

function chunkToMeta(chunk: Chunk) {
  return {
    description: '',
    chunk,
  };
}

const ChunkView = ({ chunk, removeChunk }: { chunk: Chunk; removeChunk: (a0: Chunk) => void }) => {
  const chunkMeta = useMemo(() => {
    return chunkToMeta(chunk);
  }, [chunk]);

  const handleClick = useCallback(() => {
    removeChunk(chunk);
  }, [chunk, removeChunk]);
  return (
    <PieceView chunk={chunkMeta}>
      <Pane
        flex="1"
        display="flex"
        justifyContent="flex-end"
      >
        <IconButton
          appearance="minimal"
          icon={<TrashIcon color="#B0B0B0" />}
          onClick={handleClick}
        />
      </Pane>
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
  partsCollector: PartsCollector;
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
