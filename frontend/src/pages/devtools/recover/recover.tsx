import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';
import { Chunk, Crypto, MessagePart } from '../../../services/crypto';
import {
  Alert,
  Button,
  Card,
  CogIcon,
  Group,
  Heading,
  Pane,
  TextInputField,
  UnlockIcon,
  majorScale,
  Text,
  Pre,
  Textarea,
} from 'evergreen-ui';
import { Container } from '../../../components/container';
import { isEqual } from 'lodash';

class PartsCollector {
  crypto: Promise<Crypto | void>;

  constructor(setError: (e: string) => void) {
    this.crypto = Crypto.initialize().catch((err: Error) => {
      console.error(err);
      setError(err.message);
    });
  }

  async handlePart(messageParts: MessagePart[], chunks: Chunk[], part: string) {
    const crypto = await this.getCrypto();
    const id = await crypto.identify(part);
    const { messagePart, chunk } = id;

    if (messagePart) {
      return {
        messageParts: this.addMessage(messageParts, messagePart),
        chunks,
      };
    }

    if (chunk) {
      return {
        chunks: this.addChunk(chunks, chunk),
        messageParts,
      };
    }

    throw new Error('Undetected part type.');
  }

  async restoreMessage(messageParts: MessagePart[], chunks: Chunk[]) {
    const crypto = await this.getCrypto();
    const restored = await crypto.restoreMessage(messageParts, chunks);
    return restored;
  }

  addChunk(chunks: Chunk[], chunk: Chunk) {
    // happy case :)
    if (chunks.length === 0) {
      return [chunk];
    }
    // check duplicate
    if (chunks.find((p) => isEqual(p, chunk))) {
      throw new Error('Duplicated chunk.');
    }
    // check if it matches the ones we already have
    const { version, requiredChunks, spareChunks, keyHash } = chunks[0];
    if (keyHash !== chunk.keyHash) {
      throw new Error('This chunk is for a different key.');
    }
    if (version !== chunk.version) {
      throw new Error('Version mismatch.');
    }
    if (requiredChunks !== chunk.requiredChunks || spareChunks !== chunk.spareChunks) {
      throw new Error('Chunk configuration mismatch.');
    }

    return this.insertAtLocation(chunks, chunk, (x) => x.chunkIndex);
  }

  addMessage(parts: MessagePart[], messagePart: MessagePart) {
    // happy case :)
    if (parts.length === 0) {
      return [messagePart];
    }
    // first validate if it's a duplicate
    if (parts.find((p) => isEqual(p, messagePart))) {
      throw new Error('Duplicated message part.');
    }
    // check if it matches the ones we already have
    const { version, partsTotal } = parts[0];
    if (version !== messagePart.version) {
      throw new Error('Version mismatch.');
    }
    if (partsTotal !== messagePart.partsTotal) {
      throw new Error('Mismatching number of total parts.');
    }

    return this.insertAtLocation(parts, messagePart, (x) => x.partIndex);
  }

  insertAtLocation<T, X>(destination: T[], elem: T, extract: (arg0: T) => X) {
    // find a spot where to add the parts.
    const value = extract(elem);
    const destinationIndex = destination.findIndex((x) => extract(x) > value);
    if (destinationIndex === -1) {
      return [...destination, elem];
    }

    destination.splice(destinationIndex, 0, elem);
    return [...destination];
  }

  public static howManyChunksMissing(chunks: Chunk[]) {
    if (chunks.length === 0) {
      return null;
    }
    const chunk = chunks[0];
    return Math.max(0, chunk.requiredChunks - chunks.length);
  }

  public static howManyMessagePartsMissing(parts: MessagePart[]) {
    if (parts.length === 0) {
      return null;
    }
    const p = parts[0];
    return p.partsTotal - parts.length;
  }

  async getCrypto() {
    const c = await this.crypto;
    if (!c) {
      throw new Error('Could not initialize crypto object.');
    }
    return c;
  }
}

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
    <Container>
      <Heading size="700">Recover the message</Heading>
      <ChunkInput handlePart={handlePart} error={error} />
      <RecoverySummary messageParts={messageParts} chunks={chunks} handleRestore={handleRestore} />
      <RestorationResult restoredMessage={restoredMessage} />
    </Container>
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
    <Pane padding="0">
      <Group>
        {options.map(({ label, value }) => (
          <Button key={label} isActive={mode === value} onClick={() => setMode(value)}>
            {label}
          </Button>
        ))}
      </Group>
      <br />
      <br />
      <Pane marginTop="0" border height="300px">
        {mode === 'manual' && <ManualInput handlePart={handlePart} error={error} />}
        {mode === 'qr' && <QRScanner handlePart={handlePart} error={error} />}
      </Pane>
    </Pane>
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
      <Pane border>
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
              return <MessagePartDetails key={part.partIndex} part={part} />;
            })}
          </details>
        )}
        <div style={{ clear: 'both' }}></div>
      </Pane>
      <Pane border>
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
              return <ChunkDetails key={chunk.chunkIndex} chunk={chunk} />;
            })}
          </details>
        )}
        <div style={{ clear: 'both' }}></div>
      </Pane>
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
      <Heading size="300">
        Message: {part.partIndex + 1} / {part.partsTotal}{' '}
      </Heading>
      <Heading size="200" title={part.data}>
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
      <Heading size="300">
        Chunk {chunk.chunkIndex + 1} / {chunk.requiredChunks} ( + {chunk.spareChunks}){' '}
      </Heading>
      <Heading size="200" title={chunk.keyHash}>
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
    <Pane marginTop={majorScale(2)} marginBottom={majorScale(3)} elevation={3} border>
      <Heading>Restored Message</Heading>
      <Textarea disabled value={restoredMessage}></Textarea>
    </Pane>
  );
}
