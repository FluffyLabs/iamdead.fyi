import { Button, CameraIcon, EmptyState, Pane, majorScale } from 'evergreen-ui';
import { useCallback, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Result as QrResult } from '@zxing/library';
import { OnImport } from './import-methods';

export const QrImport = ({ onImport }: { onImport: OnImport }) => {
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
