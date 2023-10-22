import { useCallback, useState } from 'react';
import { Heading, Pane, majorScale, LockIcon, Group, Button, Dialog, HeatGridIcon, DownloadIcon } from 'evergreen-ui';
import { encryptedMessageBytes } from '../../../../components/encrypted-message-view';
import { EncryptedMessageQr } from './encrypted-message-qr';
import { downloadFile } from '../../../../services/download-file';

function CloseButton({ close }: { close: () => void }) {
  return (
    <Button
      appearance="primary"
      onClick={close}
    >
      Done
    </Button>
  );
}

function onDownload(message: string[]) {
  downloadFile(message, 'text/plain', 'encrypted_message.icod.txt');
}

type Props = {
  encryptedMessage: string[];
};
export function EncryptedMessage({ encryptedMessage }: Props) {
  const [isShowingQr, setIsShowingQr] = useState(false);

  const handleDownload = useCallback(() => {
    onDownload(encryptedMessage);
  }, [encryptedMessage]);

  const Footer = ({ close }: Parameters<typeof CloseButton>[0]) => (
    <Group>
      <Button
        onClick={handleDownload}
        iconBefore={<DownloadIcon />}
      >
        Download
      </Button>
      <CloseButton close={close} />
    </Group>
  );

  return (
    <Pane
      display="flex"
      alignItems="flex-start"
    >
      <LockIcon
        size={majorScale(5)}
        marginRight={majorScale(2)}
      />
      <Pane
        flex="1"
        display="flex"
        flexDirection="column"
      >
        <Heading
          marginRight={majorScale(1)}
          marginBottom={majorScale(1)}
        >
          Encrypted message ({encryptedMessageBytes(encryptedMessage)} bytes)
        </Heading>
        <Group>
          <Button
            onClick={() => setIsShowingQr(true)}
            iconBefore={<HeatGridIcon />}
          >
            QR codes
          </Button>
          <Button
            onClick={handleDownload}
            iconBefore={<DownloadIcon />}
          >
            Download
          </Button>
        </Group>
      </Pane>
      <Dialog
        isShown={isShowingQr}
        title="Encrypted Message"
        onCloseComplete={() => setIsShowingQr(false)}
        footer={Footer}
      >
        <EncryptedMessageQr data={encryptedMessage} />
      </Dialog>
    </Pane>
  );
}
