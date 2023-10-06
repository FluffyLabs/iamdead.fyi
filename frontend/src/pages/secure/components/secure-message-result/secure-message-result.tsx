import { useCallback, useEffect, useState } from 'react';
import {
  Heading,
  Pane,
  Spinner,
  majorScale,
  Alert,
  EmptyState,
  SmallCrossIcon,
  LockIcon,
  Group,
  Button,
  ChevronLeftIcon,
  PlayIcon,
  ChevronRightIcon,
  PauseIcon,
  Dialog,
  HeatGridIcon,
  KeyIcon,
  DownloadIcon,
  ManualIcon,
} from 'evergreen-ui';
import { useSecureMessage } from '../../../../hooks/use-secure-message';
import { SecureMessageResult as CryptoResult, ChunksConfiguration } from '../../../../services/crypto';
import { Summary } from './summary';
import { QRWithClipboard } from './qr-with-clipboard';
import { Slab } from '../../../../components/slab';

export type Props = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
};

export const SecureMessageResult = ({ message, chunksConfiguration }: Props) => {
  const { secureMessage, result, error, isLoading } = useSecureMessage();

  useEffect(() => {
    secureMessage(message, chunksConfiguration);
  }, [message, chunksConfiguration, secureMessage]);

  return (
    <>
      <Summary message={message} chunksConfiguration={chunksConfiguration} />
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

const DisplayResult = ({ result, error }: { result: CryptoResult | null; error: string | null }) => {
  const [isShowingQr, setIsShowingQr] = useState(false);

  if (error) {
    return <Alert intent="danger" title={error} />;
  }

  if (!result) {
    return (
      <EmptyState title="Encryption results are not available yet." icon={<SmallCrossIcon />} iconBgColor="tint" />
    );
  }

  // TODO [ToDr] Show Chunk QR codes in one dialog with nav similar to encrypted message.
  // TODO [ToDr] Allow editing the name (by default it's "Chunk {id}")
  // TODO [ToDr] Allow adding description.
  // TODO [ToDr] Add buttons to download raw files and pdfs.
  //
  return (
    <Slab background="tint2">
      <Pane display="flex" alignItems="center">
        <LockIcon size={majorScale(5)} marginRight={majorScale(2)} />
        <Heading marginRight={majorScale(1)}>
          Encrypted message ({Math.ceil(result.encryptedMessage.join('').length / 256)} bytes)
        </Heading>
        <Group>
          <Button onClick={() => setIsShowingQr(true)} iconBefore={<HeatGridIcon />}>
            QR codes
          </Button>
          <Button onClick={() => {}} iconBefore={<DownloadIcon />}>
            Download
          </Button>
        </Group>
        <Dialog isShown={isShowingQr} title="Encrypted Message" onCloseComplete={() => setIsShowingQr(false)}>
          <EncryptedMessageQr data={result.encryptedMessage} />
        </Dialog>
      </Pane>
      {result.chunks.map((x: string, idx: number) => (
        <Chunk key={x} chunk={x} id={idx + 1} />
      ))}
    </Slab>
  );
};

function EncryptedMessageQr({ data }: { data: string[] }) {
  const [selectedPart, setSelectedPart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const part = data[selectedPart];

  const hasPrev = selectedPart > 0;
  const hasNext = selectedPart < data.length - 1;

  const prev = useCallback(() => (hasPrev ? setSelectedPart(selectedPart - 1) : null), [hasPrev, selectedPart]);
  const next = useCallback(() => (hasNext ? setSelectedPart(selectedPart + 1) : null), [hasNext, selectedPart]);
  const nextWrap = useCallback(() => setSelectedPart((selectedPart + 1) % data.length), [selectedPart, data.length]);

  const toggle = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const id = isPlaying ? window.setInterval(nextWrap, 500) : null;
    return () => {
      if (id) {
        window.clearInterval(id);
      }
    };
  }, [isPlaying, nextWrap]);

  return (
    <>
      <Pane title={part} display="flex" flexDirection="column" alignItems="center">
        <Heading size={300} textAlign="center" marginBottom={majorScale(1)}>
          Part {selectedPart + 1} / {data.length}
        </Heading>
        <QRWithClipboard value={part.toUpperCase()} />
        <Group size="small">
          <Button onClick={prev} disabled={!hasPrev || isPlaying}>
            <ChevronLeftIcon />
          </Button>
          <Button onClick={toggle} disabled={!hasPrev && !hasNext}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button onClick={next} disabled={!hasNext || isPlaying}>
            <ChevronRightIcon />
          </Button>
        </Group>
      </Pane>
    </>
  );
}

function Chunk({ id, chunk }: { id: number; chunk: string }) {
  // TODO [ToDr] QR code value should rather be a link.
  const [isShowingQr, setIsShowingQr] = useState(false);
  return (
    <Slab padding={0} marginY={majorScale(5)} title={chunk} display="flex">
      <KeyIcon size={majorScale(5)} marginRight={majorScale(2)} />
      <Heading marginRight={majorScale(1)}>Chunk {id}</Heading>
      <Group>
        <Button iconBefore={<HeatGridIcon />} onClick={() => setIsShowingQr(true)}>
          QR
        </Button>
        <Button iconBefore={<DownloadIcon />}>Download</Button>
        <Button iconBefore={<ManualIcon />}>Certificate</Button>
      </Group>
      <Dialog isShown={isShowingQr} title={`Chunk ${id}`} onCloseComplete={() => setIsShowingQr(false)}>
        <QRWithClipboard value={chunk.toUpperCase()} />
      </Dialog>
    </Slab>
  );
}
