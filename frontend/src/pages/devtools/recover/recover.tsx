import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';
/// TODO [ToDr] Move to some service file.
import { Chunk, Crypto, MessagePart } from '../../../services/crypto';
import { Alert, Button, Card, CogIcon, Group, Pane, TextInputField, UnlockIcon } from 'evergreen-ui';
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
      <h1>Recover the message</h1>
      <ChunkInput handlePart={handlePart} error={error} />
      <RestorationResult restoredMessage={restoredMessage} />
      <RecoverySummary messageParts={messageParts} chunks={chunks} handleRestore={handleRestore} />
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
    <Pane>
      <Group>
        {options.map(({ label, value }) => (
          <Button key={label} isActive={mode === value} onClick={() => setMode(value)}>
            {label}
          </Button>
        ))}
      </Group>
      <br />
      <br />
      <Pane padding="20px" elevation={1} border height="300px">
        {mode === 'manual' && <ManualInput handlePart={handlePart} error={error} />}
        {mode === 'qr' && <QRScanner handlePart={handlePart} error={error} />}
      </Pane>
    </Pane>
  );
}

function ManualInput({ handlePart, error }: HandleChunkProps) {
  const [val, setVal] = useState('');

  return (
    <Pane>
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
    </Pane>
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
      <Button
        size="large"
        iconBefore={<UnlockIcon />}
        disabled={!isReadyForRestoration}
        appearance={isReadyForRestoration ? 'primary' : undefined}
        onClick={handleRestore}
      >
        Restore The Message
      </Button>
      <h3>Message:</h3>
      <details>
        <summary>
          {missingParts === null ? (
            ''
          ) : missingParts === 0 ? (
            <span>Message is complete.</span>
          ) : (
            <span>Still missing {missingParts} parts.</span>
          )}
        </summary>
        {messageParts.map((part) => {
          return <MessagePartDetails key={part.partIndex} part={part} />;
        })}
      </details>
      <h3 style={{ clear: 'both' }}>Chunks:</h3>
      <details>
        <summary>
          {missingChunks === null ? (
            ''
          ) : missingChunks === 0 ? (
            <span>Enough chunks received.</span>
          ) : (
            <span>Still missing at least {missingChunks} chunks.</span>
          )}
        </summary>
        {chunks.map((chunk) => {
          return <ChunkDetails key={chunk.chunkIndex} chunk={chunk} />;
        })}
      </details>
    </>
  );
}

function MessagePartDetails({ part }: { part: MessagePart }) {
  const json = JSON.stringify(part, null, 2);
  return (
    <Card float="left" margin="20px" padding="20px" elevation={2} width="250px" title={json} overflow="hidden" border>
      <h3>
        Message: {part.partIndex + 1} / {part.partsTotal}{' '}
      </h3>
      <h4 title={part.data}>{Math.floor((part.data.length / 8) * 5)} bytes</h4>
      <pre style={{ maxWidth: '100%' }}>{json}</pre>
    </Card>
  );
}

function ChunkDetails({ chunk }: { chunk: Chunk }) {
  const json = JSON.stringify(chunk, null, 2);
  return (
    <Card float="left" margin="20px" padding="20px" elevation={2} width="250px" title={json} overflow="hidden" border>
      <h3>
        Chunk {chunk.chunkIndex + 1} / {chunk.requiredChunks} ( + {chunk.spareChunks}){' '}
      </h3>
      <h4 title={chunk.keyHash}>{chunk.keyHash.slice(0, 16)}...</h4>
      <pre style={{ maxWidth: '100%' }}>{json}</pre>
    </Card>
  );
}

function RestorationResult({ restoredMessage }: { restoredMessage: string | null }) {
  if (!restoredMessage) {
    return null;
  }

  return (
    <Pane padding="20px" marginTop="20px" marginBottom="20px" elevation={3} border>
      <h4>Restored Message</h4>
      <textarea disabled value={restoredMessage}></textarea>
    </Pane>
  );
}
