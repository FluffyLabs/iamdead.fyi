import { Button, FileUploader, Group, Label, Popover, TextInput, UploadIcon, majorScale } from 'evergreen-ui';
import { ChangeEvent, ClipboardEvent, useCallback, useState } from 'react';
import { Slab } from '../../../components/slab';
import { OnImport } from './import-methods';

export const FileImport = ({ onImport, error }: { onImport: OnImport; error: string | null }) => {
  const [manualValue, setManualValue] = useState('');
  const [isPaste, setIsPaste] = useState(false);

  const handleManualClick = useCallback(() => {
    onImport(null, manualValue);
  }, [manualValue, onImport]);

  const handleManualChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setManualValue(value);
      if (isPaste) {
        onImport(null, value);
        setIsPaste(false);
        e.target.setSelectionRange(0, value.length);
      }
    },
    [setManualValue, isPaste, onImport],
  );

  const handleManualPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      setIsPaste(true);
    },
    [setIsPaste],
  );

  const handleChange = useCallback(
    (files: any[]) => {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = event?.target?.result;
          if (typeof res === 'string') {
            onImport(null, res);
          } else {
            onImport(new Error(`Unable to read file: ${file.name}`), null);
          }
        };
        reader.onerror = (event) => {
          const error = event?.target?.error;
          if (error) {
            onImport(error, null);
          }
        };
        reader.readAsText(file);
      });
      console.log(files);
    },
    [onImport],
  );

  const handleRejected = useCallback((fileRejections: any) => {
    console.error(fileRejections);
  }, []);

  return (
    <>
      <FileUploader
        maxSizeInBytes={16 * 1024 ** 2}
        onAccepted={handleChange}
        onRejected={handleRejected}
      />
      <Popover
        bringFocusInside
        content={
          <Slab>
            <Label>Paste a string to import</Label>
            <br />
            <Group marginTop={majorScale(1)}>
              <TextInput
                autoFocus
                width="200px"
                placeholder="ICOD-???:"
                value={manualValue}
                onChange={handleManualChange}
                onPaste={handleManualPaste}
                isInvalid={!!error}
              />
              <Button
                appearance="primary"
                onClick={handleManualClick}
                disabled={manualValue.trim().length === 0}
              >
                <UploadIcon />
              </Button>
            </Group>
          </Slab>
        }
      >
        <Button>Manual input</Button>
      </Popover>
    </>
  );
};
