import { ChangeEvent, ReactEventHandler, SetStateAction, useCallback, useMemo, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';
/// TODO [ToDr] Move to some service file.
import { Crypto, IdentificationResult } from '../editor/crypto';
import { Alert, Button, CogIcon, Group, Pane, TextInputField } from 'evergreen-ui';
import { Container } from '../../components/container';

export const Recover = () => {
  const [error, setError] = useState(null as string | null);
  const [rawData, setRawData] = useState([] as IdentificationResult[]);
  const handleChunk = useCallback(
    (chunk: string) => {
      Crypto.initialize()
        .then((crypto) => {
          return crypto.identify(chunk);
        })
        .then((identification) => {
          setRawData([...rawData, identification]);
          setError(null);
        })
        .catch((e) => {
          console.error(e);
          setError(e);
        });
    },
    [rawData, setRawData],
  );
  return (
    <Container>
      <h1>Recover the message</h1>
      <ChunkInput handleChunk={handleChunk} error={error} />
      <RecoverySummary />
      <pre>{JSON.stringify(rawData, null, 2)}</pre>
    </Container>
  );
};

type HandleChunkProps = {
  handleChunk: (arg0: string) => void;
  error: string | null;
};

function ChunkInput({ handleChunk, error }: HandleChunkProps) {
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
        {mode === 'manual' && <ManualInput handleChunk={handleChunk} error={error} />}
        {mode === 'qr' && <QRScanner handleChunk={handleChunk} error={error} />}
      </Pane>
    </Pane>
  );
}

function ManualInput({ handleChunk, error }: HandleChunkProps) {
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
        onClick={() => handleChunk(val)}
        disabled={!val}
        appearance="primary"
        iconBefore={<CogIcon />}
      >
        Parse
      </Button>
    </Pane>
  );
}

function QRScanner({ handleChunk, error }: HandleChunkProps) {
  const [qrError, setQrError] = useState(null as string | null);

  const handleResult = (data: Result | null | undefined, err: Error | null | undefined) => {
    if (err) {
      setQrError(err.message);
      return;
    }

    if (data) {
      console.log(data);
      setQrError(null);
      handleChunk(data.getText());
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

function RecoverySummary() {
  return <h3>Scan the first QR code</h3>;
}
