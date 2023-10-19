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
import { ChangeEvent, ClipboardEvent, useCallback, useMemo, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result as QrResult } from '@zxing/library';
import { Slab } from '../../components/slab';
import { PartsCollector } from '../../services/parts-collector';
import { Chunk, MessagePart } from '../../services/crypto';

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
  const [messageParts, setMessageParts] = useState([] as MessagePart[]);
  const [chunks, setChunks] = useState([] as Chunk[]);

  const partsCollector = useMemo(() => new PartsCollector(setError), []);

  const handleImport = useCallback(
    (err: Error | null, input: string | null) => {
      if (err) {
        console.error(err);
        setError(err.message);
        return;
      }
      setError(null);
      if (!input) {
        console.warn('onImport callback with no error nor input');
        return;
      }

      partsCollector
        .handlePart(messageParts, chunks, input)
        .then((res) => {
          setChunks(res.chunks);
          setMessageParts(res.messageParts);
        })
        .catch((e: Error) => {
          setError(e.message);
          console.error(e);
        });
    },
    [setError, setChunks, setMessageParts, partsCollector, messageParts, chunks],
  );

  return (
    <>
      <Paragraph>Drag &amp; drop the pieces and encrypted message or scan QR codes from an offline device.</Paragraph>
      <Pane
        marginY={majorScale(2)}
        display="flex"
      >
        <ImportMethods
          onImport={handleImport}
          error={error}
        />
      </Pane>
      {error && <Alert intent="danger">{error}</Alert>}
    </>
  );
};

const ImportMethods = ({ onImport, error }: { onImport: OnImport; error: string | null }) => {
  return (
    <>
      <Card
        elevation={1}
        flex="1"
        padding={majorScale(2)}
        marginRight={majorScale(3)}
        textAlign="center"
      >
        <FileImport
          onImport={onImport}
          error={error}
        />
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
          onClick={toggleQrEnabled}
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
            onClick={toggleQrEnabled}
            appearance="primary"
          >
            Enable camera
          </EmptyState.PrimaryButton>
        }
      />
    </Pane>
  );
};

const FileImport = ({ onImport, error }: { onImport: OnImport; error: string | null }) => {
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
    [setManualValue, isPaste],
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
