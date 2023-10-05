import { useEffect } from 'react';
import { Card, Heading, Pane, Spinner, TextInputField, majorScale, Alert } from 'evergreen-ui';
import { QRCodeSVG } from 'qrcode.react';
import { useSecureMessage } from '../../../hooks/use-secure-message';
import { SecureMessageResult as CryptoResult, ChunksConfiguration } from '../../../services/crypto';

type SecureMessageResultProps = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
};

export const SecureMessageResult = ({ message, chunksConfiguration }: SecureMessageResultProps) => {
  const { secureMessage, result, error, isLoading } = useSecureMessage();

  useEffect(() => {
    secureMessage(message, chunksConfiguration);
  }, [message, chunksConfiguration, secureMessage]);

  return (
    <>
      <IsLoading isLoading={isLoading} />
      <DisplayResult result={result} error={error} />
    </>
  );
};

const IsLoading = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) {
    return null;
  }
  // TODO [ToDr] Spinner should only be displayed after some timeout.
  return <Spinner marginX="auto" marginY={majorScale(2)} />;
};

function DisplayResult({ result, error }: { result: CryptoResult | null; error: string | null }) {
  if (error) {
    return <Alert intent="danger" title={error} />;
  }

  if (!result) {
    return null;
  }

  return (
    <Pane>
      <Heading>Encrypted message</Heading>
      <Card margin="0" padding="0" display="flex" justifyContent="center" flexWrap="wrap">
        <EncryptedMessage data={result.encryptedMessage} />
      </Card>
      <Heading>Recovery chunks</Heading>
      <Card margin="0" padding="0" display="flex" justifyContent="center" flexWrap="wrap">
        {result.chunks.map((x: string, idx: number) => (
          <Chunk key={x} chunk={x} id={idx + 1} />
        ))}
      </Card>
    </Pane>
  );
}

function EncryptedMessage({ data }: { data: string[] }) {
  const parts = data;
  return (
    <>
      {parts.map((part: string, idx: number) => (
        <Pane margin={majorScale(5)} title={part} key={part}>
          <Heading size="400">Message Part {idx + 1}</Heading>
          <br />
          <QRCodeSVG value={part.toUpperCase()} />
          <TextInputField type="text" disabled value={part.toUpperCase()} />
        </Pane>
      ))}
    </>
  );
}

function Chunk({ id, chunk }: { id: number; chunk: string }) {
  // TODO [ToDr] QR code value should rather be a link.
  // TODO [ToDr] We use upper case now to switch to alphanumeric mode of QR
  return (
    <Pane margin={majorScale(5)} title={chunk}>
      <Heading size="400">Chunk {id}</Heading>
      <br />
      <QRCodeSVG value={chunk.toUpperCase()} />
      <TextInputField type="text" disabled value={chunk.toUpperCase()} />
    </Pane>
  );
}
