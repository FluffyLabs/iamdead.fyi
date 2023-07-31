import { Fragment, useCallback, useState } from 'react';
import ReactQuill from 'react-quill';
import { Crypto, SecureMessageResult } from './crypto';
import 'react-quill/dist/quill.snow.css';
import { QRCodeSVG } from 'qrcode.react';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image'],
    ['clean'],
  ],
};

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
    <div>
      <h1>ICOD Editor</h1>
      <Configuration
        value={configuration}
        onChange={setConfiguration}
        onSecureMessage={handleSecureMessage}
      />
      <div style={{ maxWidth: '75%', margin: 'auto' }}>
        <ReactQuill
          theme="snow"
          value={value}
          modules={modules}
          onChange={handleChange}
        />
      </div>
      <IsLoading isLoading={isLoading} />
      <DisplayResult result={result} error={error} />
    </div>
  );
};

function IsLoading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }
  return <p>Encrypting...</p>;
}

function DisplayResult({
  result,
  error,
}: {
  result: SecureMessageResult | null;
  error: string | null;
}) {
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
    <div>
      <h3>Encrypted message</h3>
      <div
        style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <EncryptedMessage
          data={result.encryptedMessage.data + result.encryptedMessage.nonce}
        />
      </div>
      <h4>Recovery chunks</h4>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {result.chunks.map((x, idx) => (
          <Chunk key={x} chunk={x} id={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function EncryptedMessage({ data }: { data: string }) {
  const parts = splitMessage(data);
  return (
    <Fragment>
      {parts.map((part: string, idx) => (
        <div style={{ margin: 50 }} title={part}>
          <h3>Message Part {idx + 1}</h3>
          <QRCodeSVG value={part} />
        </div>
      ))}
    </Fragment>
  );
}

function splitMessage(message: string) {
  const THRESHOLD = 250;
  if (message.length <= THRESHOLD) {
    return [message];
  }
  const noOfParts = message.length / THRESHOLD;
  const msg = message.split('');
  const parts = [];
  for (let i = 0; i < noOfParts; i += 1) {
    parts.push(msg.splice(0, THRESHOLD).join(''));
  }
  return parts;
}

function Chunk({ id, chunk }: { id: number; chunk: string }) {
  // TODO [ToDr] QR code value should rather be a link.
  return (
    <div style={{ margin: 20 }} title={chunk}>
      <h3>Chunk {id}</h3>
      <QRCodeSVG value={chunk} />
    </div>
  );
}

type Config = {
  required: number;
  spare: number;
};

function Configuration({
  value,
  onChange,
  onSecureMessage,
}: {
  value: Config;
  onChange: (e: Config) => void;
  onSecureMessage: () => void;
}) {
  return (
    <form>
      <fieldset>
        <label>
          Required Chunks <br />
          <input
            type="number"
            value={value.required}
            onChange={(e) => {
              onChange({ ...value, required: parseInt(e.target.value) || 0 });
            }}
          />
        </label>
      </fieldset>
      <br />
      <fieldset>
        <label>
          Spare Chunks
          <br />
          <input
            type="number"
            value={value.spare}
            onChange={(e) => {
              onChange({ ...value, spare: parseInt(e.target.value) || 0 });
            }}
          />
        </label>
      </fieldset>
      <br />
      <button
        onClick={(e) => {
          onSecureMessage();
          e.preventDefault();
          return false;
        }}
      >
        Encrypt the message
      </button>
      <br />
    </form>
  );
}
