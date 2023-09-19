import { useCallback, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';
/// TODO [ToDr] Move to some service file.
import { Crypto, IdentificationResult } from '../editor/crypto';

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
    <div>
      <h1>Recover the message</h1>
      <QRScanner handleChunk={handleChunk} />
      {error && <pre>{error}</pre>}
      <RecoverySummary />
      <pre>{JSON.stringify(rawData, null, 2)}</pre>
    </div>
  );
};

function QRScanner({ handleChunk }: { handleChunk: (arg0: string) => void }) {
  const [val, setVal] = useState('');
  const handleResult = (data: Result | null | undefined, err: Error | null | undefined) => {
    if (err) {
      console.error(err);
      return;
    }

    if (data) {
      console.log(data);
      handleChunk(data.getText());
    }
  };

  // <QrReader
  //   constraints={{ facingMode: 'environment' }}
  //   scanDelay={300}
  //   onResult={handleResult}
  //   containerStyle={{ width: '150px' }}
  // />
  return (
    <div>
      <input
        type="text"
        onChange={(e) => {
          setVal(e.currentTarget.value);
        }}
        value={val}
      />
      <button
        onClick={(e) => {
          handleChunk(val);
        }}
      >
        Manual input
      </button>
    </div>
  );
}

function RecoverySummary() {
  return <h3>Scan the first QR code</h3>;
}
