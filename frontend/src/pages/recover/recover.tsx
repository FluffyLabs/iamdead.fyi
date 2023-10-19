import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';
import { Chunk, MessagePart } from '../../services/crypto';
import {
  Alert,
  Button,
  Card,
  CogIcon,
  Group,
  Heading,
  TextInputField,
  UnlockIcon,
  majorScale,
  Text,
  Pre,
  Textarea,
} from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { Slab } from '../../components/slab';
import { PartsCollector } from '../../services/parts-collector';

export const Recover = () => {
  const [error, setError] = useState(null as string | null);
  const [messageParts, setMessageParts] = useState([] as MessagePart[]);
  const [chunks, setChunks] = useState([] as Chunk[]);
  const [restoredMessage, setRestoredMessage] = useState(null as string | null);

  const partsCollector = useMemo(() => new PartsCollector(setError), []);
  const handlePart = useCallback(
    (part: string) => {
      setError(null);
      partsCollector
        .handlePart(messageParts, chunks, part)
        .then((res) => {
          setChunks(res.chunks);
          setMessageParts(res.messageParts);
        })
        .catch((e: Error) => {
          console.error(e);
          setError(e.message);
        });
    },
    [messageParts, chunks, partsCollector],
  );
  const handleRestore = useCallback(() => {
    partsCollector
      .restoreMessage(messageParts, chunks)
      .then((res) => {
        setRestoredMessage(res);
      })
      .catch((e: Error) => {
        console.error(e);
        setError(e.message);
      });
  }, [messageParts, chunks, partsCollector]);
  return (
    <>
      <Navigation />
      <Container>
        <Heading size={700}>Recover the message</Heading>
        <ChunkInput
          handlePart={handlePart}
          error={error}
        />
        <RecoverySummary
          messageParts={messageParts}
          chunks={chunks}
          handleRestore={handleRestore}
        />
        <RestorationResult restoredMessage={restoredMessage} />
      </Container>
    </>
  );
};

type HandleChunkProps = {
  handlePart: (arg0: string) => void;
  error: string | null;
};

function ChunkInput({ handlePart, error }: HandleChunkProps) {
  const options = useMemo(
    () => [
      { label: 'Manual', value: 'manual' },
      { label: 'QR', value: 'qr' },
    ],
    [],
  );
  const [mode, setMode] = useState('manual');

  return (
    <Slab padding="0">
      <Group>
        {options.map(({ label, value }) => (
          <Button
            key={label}
            isActive={mode === value}
            onClick={() => setMode(value)}
          >
            {label}
          </Button>
        ))}
      </Group>
      <br />
      <br />
      <Slab
        marginTop="0"
        border
        height="300px"
      >
        {mode === 'manual' && (
          <ManualInput
            handlePart={handlePart}
            error={error}
          />
        )}
        {mode === 'qr' && (
          <QRScanner
            handlePart={handlePart}
            error={error}
          />
        )}
      </Slab>
    </Slab>
  );
}

function ManualInput({ handlePart, error }: HandleChunkProps) {
  const [val, setVal] = useState('');

  return (
    <>
      <TextInputField
        label="ICOD chunk"
        placeholder="ICOD-???:"
        onChange={(e: ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
        value={val}
        isInvalid={!!error}
        validationMessage={error}
      />
      <Button
        size="large"
        onClick={() => {
          handlePart(val);
          setVal('');
        }}
        disabled={!val}
        appearance={val ? 'primary' : undefined}
        iconBefore={<CogIcon />}
      >
        Parse
      </Button>
    </>
  );
}

function QRScanner({ handlePart, error }: HandleChunkProps) {
  const [qrError, setQrError] = useState(null as string | null);

  const handleResult = (data: Result | null | undefined, err: Error | null | undefined) => {
    if (err) {
      setQrError(err.message);
      return;
    }

    if (data) {
      console.log(data);
      setQrError(null);
      handlePart(data.getText());
    }
  };

  const e = qrError || error;

  return (
    <>
      {e && <Alert intent="danger">{e}</Alert>}
      <QrReader
        constraints={{ facingMode: 'environment' }}
        scanDelay={300}
        onResult={handleResult}
        containerStyle={{ width: '150px' }}
      />
    </>
  );
}

function RecoverySummary({
  messageParts,
  chunks,
  handleRestore,
}: {
  messageParts: MessagePart[];
  chunks: Chunk[];
  handleRestore: () => void;
}) {
  const missingParts = PartsCollector.howManyMessagePartsMissing(messageParts);
  const missingChunks = PartsCollector.howManyChunksMissing(chunks);

  const isReadyForRestoration = missingParts !== null && missingChunks !== null && missingParts + missingChunks === 0;
  return (
    <>
      <Slab border>
        <Heading>Message:</Heading>
        {!!messageParts.length && (
          <details>
            <summary>
              {missingParts === null ? (
                ''
              ) : missingParts === 0 ? (
                <Text>Message is complete.</Text>
              ) : (
                <Text>Still missing {missingParts} parts.</Text>
              )}
            </summary>
            {messageParts.map((part) => {
              return (
                <MessagePartDetails
                  key={part.partIndex}
                  part={part}
                />
              );
            })}
          </details>
        )}
        <div style={{ clear: 'both' }}></div>
      </Slab>
      <Slab border>
        <Heading>Chunks:</Heading>
        {!!chunks.length && (
          <details>
            <summary>
              {missingChunks === null ? (
                ''
              ) : missingChunks === 0 ? (
                <Text>Enough chunks received.</Text>
              ) : (
                <Text>Still missing at least {missingChunks} chunks.</Text>
              )}
            </summary>
            {chunks.map((chunk) => {
              return (
                <ChunkDetails
                  key={chunk.chunkIndex}
                  chunk={chunk}
                />
              );
            })}
          </details>
        )}
        <div style={{ clear: 'both' }}></div>
      </Slab>
      <Button
        size="large"
        iconBefore={<UnlockIcon />}
        disabled={!isReadyForRestoration}
        appearance={isReadyForRestoration ? 'primary' : undefined}
        onClick={handleRestore}
      >
        Restore The Message
      </Button>
    </>
  );
}

function MessagePartDetails({ part }: { part: MessagePart }) {
  const json = JSON.stringify(part, null, 2);
  return (
    <Card
      marginRight={majorScale(3)}
      marginBottom={majorScale(3)}
      float="left"
      elevation={2}
      width="250px"
      title={json}
      overflow="auto"
      border
    >
      <Heading size={300}>
        Message: {part.partIndex + 1} / {part.partsTotal}{' '}
      </Heading>
      <Heading
        size={200}
        title={part.data}
      >
        {Math.floor((part.data.length / 8) * 5)} bytes
      </Heading>
      <Pre style={{ maxWidth: '100%' }}>{json}</Pre>
    </Card>
  );
}

function ChunkDetails({ chunk }: { chunk: Chunk }) {
  const json = JSON.stringify(chunk, null, 2);
  return (
    <Card
      marginRight={majorScale(3)}
      marginBottom={majorScale(3)}
      float="left"
      elevation={2}
      width="250px"
      title={json}
      overflow="auto"
      border
    >
      <Heading size={300}>
        Chunk {chunk.chunkIndex + 1} / {chunk.requiredChunks} ( + {chunk.spareChunks}){' '}
      </Heading>
      <Heading
        size={200}
        title={chunk.keyHash}
      >
        {chunk.keyHash.slice(0, 16)}...
      </Heading>
      <Pre style={{ maxWidth: '100%' }}>{json}</Pre>
    </Card>
  );
}

function RestorationResult({ restoredMessage }: { restoredMessage: string | null }) {
  if (!restoredMessage) {
    return null;
  }

  return (
    <Slab
      marginTop={majorScale(2)}
      marginBottom={majorScale(3)}
      elevation={3}
      border
    >
      <Heading>Restored Message</Heading>
      <Textarea
        disabled
        value={restoredMessage}
      ></Textarea>
    </Slab>
  );
}
