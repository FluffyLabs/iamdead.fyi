import { useCallback, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [value, setValue] = useState('');
  const [configuration, setConfiguration] = useState({
    required: 2,
    spare: 1,
  });

  const handleSecureMessage = useCallback(() => {
    console.log('Call into Rust with', value, configuration);
  }, [value, configuration]);

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
          onChange={setValue}
        />
      </div>
    </div>
  );
};

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
