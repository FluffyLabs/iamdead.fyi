import {
  Alert,
  Button,
  CameraIcon,
  Card,
  EmptyState,
  FileUploader,
  Group,
  Heading,
  Label,
  Pane,
  Paragraph,
  Popover,
  TextInput,
  UploadIcon,
  majorScale,
} from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { ChangeEvent, useCallback, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result as QrResult } from '@zxing/library';
import { Slab } from '../../components/slab';

export const Scan = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Import the encrypted message and pieces.
        </Heading>
        <Import />
      </Container>
    </>
  );
};

type OnImport = (err: Error | null, input: string | null) => void;

const Import = () => {
  const [error, setError] = useState(null as string | null);

  const handleImport = useCallback(
    ((err, input) => {
      if (err) {
        console.error(err);
        setError(err.message);
        return;
      }
      setError(null);
    }) as OnImport,
    [setError],
  );

  return (
    <>
      <Paragraph>Drag &amp; drop the pieces and encrypted message or scan QR codes from an offline device.</Paragraph>
      <Pane
        marginTop={majorScale(2)}
        display="flex"
      >
        <ImportMethods onImport={handleImport} />
        {error && <Alert intent="danger">{error}</Alert>}
      </Pane>
    </>
  );
};

const ImportMethods = ({ onImport }: { onImport: OnImport }) => {
  return (
    <>
      <Card
        elevation={1}
        flex="1"
        padding={majorScale(2)}
        marginRight={majorScale(3)}
        textAlign="center"
      >
        <FileImport onImport={onImport} />
      </Card>
      <Card
        elevation={1}
        flex="1"
        padding={majorScale(2)}
        textAlign="center"
      >
        <QrImport onImport={onImport} />
      </Card>
    </>
  );
};

const QrImport = ({ onImport }: { onImport: OnImport }) => {
  const [isQrEnabled, setQrEnabled] = useState(false);
  const toggleQrEnabled = useCallback(() => {
    setQrEnabled(!isQrEnabled);
  }, [isQrEnabled, setQrEnabled]);

  const handleQrResult = useCallback(
    (data?: QrResult | null, err?: Error | null) => {
      if (err) {
        onImport(err, null);
        return;
      }

      if (data) {
        console.log(data);
        onImport(null, data.getText());
        return;
      }
    },
    [onImport],
  );

  if (isQrEnabled) {
    return (
      <>
        <Button
          marginBottom={majorScale(2)}
          onClick={() => toggleQrEnabled()}
        >
          Disable camera
        </Button>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          scanDelay={300}
          onResult={handleQrResult}
          videoStyle={{ height: 'auto' }}
        />
      </>
    );
  }
  return (
    <Pane marginTop={majorScale(2)}>
      <EmptyState
        background="light"
        title="Turn on your camera to scan QR codes"
        orientation="vertical"
        icon={<CameraIcon color="#EBAC91" />}
        iconBgColor="#F8E3DA"
        primaryCta={
          <EmptyState.PrimaryButton
            onClick={() => toggleQrEnabled()}
            appearance="primary"
          >
            Enable camera
          </EmptyState.PrimaryButton>
        }
      />
    </Pane>
  );
};

const FileImport = ({ onImport }: { onImport: OnImport }) => {
  const [files, setFiles] = useState([] as any[]);
  const [manualValue, setManualValue] = useState('');

  const handleManualClick = useCallback(() => {
    // TODO [ToDr] some preliminary validation?
    onImport(null, manualValue);
    setManualValue('');
  }, [manualValue, onImport]);

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
      setFiles(files);
    },
    [setFiles, onImport],
  );

  const handleRejected = useCallback((fileRejections: any) => {
    console.error(fileRejections);
  }, []);

  return (
    <>
      <FileUploader
        maxSizeInBytes={16 * 1024 ** 2}
        onChange={handleChange}
        onRejected={handleRejected}
      />
      <Popover
        bringFocusInside
        content={
          <Slab>
            <Label>Paste the string to import</Label>
            <br />
            <Group marginTop={majorScale(1)}>
              <TextInput
                width="200px"
                placeholder="ICOD-???:"
                value={manualValue}
                // TODO [ToDr] On Paste - perform onImport already.
                onChange={(e: ChangeEvent<HTMLInputElement>) => setManualValue(e.target.value)}
              />
              <Button
                appearance="primary"
                onClick={handleManualClick}
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
