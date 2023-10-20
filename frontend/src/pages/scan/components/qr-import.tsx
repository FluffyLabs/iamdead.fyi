import { Button, CameraIcon, EmptyState, InlineAlert, Pane, majorScale } from 'evergreen-ui';
import { useCallback, useState } from 'react';
import { OnImport } from './import-methods';
import { QrReader } from './qr-reader';

export const QrImport = ({ onImport }: { onImport: OnImport }) => {
  const [isQrEnabled, setQrEnabled] = useState(false);
  const toggleQrEnabled = useCallback(() => {
    setQrEnabled(!isQrEnabled);
  }, [isQrEnabled, setQrEnabled]);

  const handleQrResult = useCallback(
    (data: string) => {
      console.log(data);
      onImport(null, data);
    },
    [onImport],
  );

  // TODO message parts
  const hasAllMessageParts = false;

  if (isQrEnabled) {
    return (
      <Pane marginTop={majorScale(1)}>
        <QrReader
          delay={300}
          onResult={handleQrResult}
        >
          <InlineAlert intent="danger">We are not able to access a camera.</InlineAlert>
        </QrReader>
        <Button
          marginTop={majorScale(3)}
          marginBottom={majorScale(2)}
          onClick={toggleQrEnabled}
        >
          Disable camera
        </Button>
      </Pane>
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
