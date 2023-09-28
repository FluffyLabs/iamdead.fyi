import { Fragment, useCallback, useState, ChangeEvent, MouseEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, TextInputField, Pane, KeyIcon, Heading, Card, majorScale } from 'evergreen-ui';

import { Crypto, SecureMessageResult } from '../../../services/crypto';
import { MessageEditor } from '../../../components/message-editor';
import { Container } from '../../../components/container';

export const Editor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState<SecureMessageResult | null>(null);
  const [configuration, setConfiguration] = useState({
    required: 2,
    spare: 1,
  });

  const handleSecureMessage = useCallback(() => {
    setError(null);
    setIsLoading(true);
    console.log('Call into Rust with', value, configuration);
    Crypto.initialize()
      .then((crypto) => {
        return crypto.secureMessage(value, configuration);
      })
      .then((result) => {
        setResult(result);
        console.log(result.chunks);
        console.log(result.encryptedMessage);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [value, configuration, setIsLoading, setResult, setError]);

  const handleChange = useCallback(
    (value: string) => {
      setValue(value);
      setResult(null);
      setError(null);
    },
    [setValue, setResult, setError],
  );

  return (
    <Container>
      <Heading size="700">ICOD Editor</Heading>
      <Configuration value={configuration} onChange={setConfiguration} />
      <MessageEditor value={value} onChange={handleChange} />
      <Button
        size="large"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          handleSecureMessage();
          e.preventDefault();
        }}
        appearance="primary"
        iconBefore={<KeyIcon />}
      >
        Encrypt the message
      </Button>
      <IsLoading isLoading={isLoading} />
      <DisplayResult result={result} error={error} />
    </Container>
  );
};

function IsLoading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }
  return <p>Encrypting...</p>;
}

function DisplayResult({ result, error }: { result: SecureMessageResult | null; error: string | null }) {
  if (error) {
    return (
      <div>
        <strong>{error}</strong>
      </div>
    );
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
      <Card margin="0" padding="0" display="flex" justifyContent="center">
        {result.chunks.map((x, idx) => (
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
      {parts.map((part: string, idx) => (
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

type Config = {
  required: number;
  spare: number;
};

function Configuration({ value, onChange }: { value: Config; onChange: (e: Config) => void }) {
  return (
    <form>
      <Pane border>
        <TextInputField
          label="Required Chunks"
          type="number"
          value={value.required}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange({ ...value, required: parseInt(e.target.value) || 0 });
          }}
        />
        <TextInputField
          label="Spare Chunks"
          type="number"
          value={value.spare}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onChange({ ...value, spare: parseInt(e.target.value) || 0 });
          }}
        />
      </Pane>
    </form>
  );
}
