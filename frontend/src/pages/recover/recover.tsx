import { useCallback, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result } from '@zxing/library';

export const Recover = () => {
  const [chunkData, setChunkData] = useState([] as string[]);
  const handleChunk = useCallback(
    (chunk: string) => {
      setChunkData([...chunkData, chunk]);
    },
    [chunkData, setChunkData],
  );
  return (
    <div>
      <h1>Recover the message</h1>
      <QRScanner handleChunk={handleChunk} />
      <RecoverySummary />
      <pre>{JSON.stringify(chunkData)}</pre>
    </div>
  );
};

function QRScanner({ handleChunk }: { handleChunk: (arg0: string) => void }) {
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

  return (
    <div>
      <QrReader
        constraints={{ facingMode: 'environment' }}
        scanDelay={300}
        onResult={handleResult}
        containerStyle={{ width: '150px' }}
      />
    </div>
  );
}

function RecoverySummary() {
  return <h3>Scan the first QR code</h3>;
}
