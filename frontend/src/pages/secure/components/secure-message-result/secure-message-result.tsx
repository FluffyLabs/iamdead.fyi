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
  TextInputField,
  EditIcon,
  Link,
  Card,
  Paragraph,
} from 'evergreen-ui';
import { useSecureMessage } from '../../../../hooks/use-secure-message';
import { SecureMessageResult as CryptoResult, ChunksConfiguration } from '../../../../services/crypto';
import { Summary } from './summary';
import { QRWithClipboard } from './qr-with-clipboard';
import { Slab } from '../../../../components/slab';
import { ChunksMeta } from '../../../../components/piece-view';

export type Props = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
  setResult: (a0: Result | null) => void;
};

export type Result = {
  encryptedMessage: string[];
  encryptedMessageBytes: number;
  chunks: ChunksMeta[];
};

export const SecureMessageResult = ({ message, chunksConfiguration, setResult }: Props) => {
  const { secureMessage, result, error, isLoading } = useSecureMessage();

  useEffect(() => {
    secureMessage(message, chunksConfiguration).then((val) => {
      if (!val) {
        setResult(val);
        return;
      }

      const { encryptedMessage } = val;
      const chunks = val.chunks.map((c, idx) => ({
        name: `Piece ${idx + 1}`,
        description: '',
        value: c,
      }));
      setResult({
        encryptedMessage,
        encryptedMessageBytes: encryptedMessageBytes(encryptedMessage),
        chunks,
      });
    });
  }, [message, chunksConfiguration, secureMessage, setResult]);

  return (
    <>
      <Summary
        message={message}
        chunksConfiguration={chunksConfiguration}
      />
      <IsLoading isLoading={isLoading} />
      <DisplayResult
        result={result}
        error={error}
      />
    </>
  );
};

function encryptedMessageBytes(encryptedMessage: string[]) {
  return Math.ceil(encryptedMessage.join('').length / 256);
}

const IsLoading = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) {
    return null;
  }
  // TODO [ToDr] Spinner should only be displayed after some timeout.
  return (
    <Spinner
      marginX="auto"
      marginY={majorScale(2)}
    />
  );
};

const DisplayResult = ({ result, error }: { result: CryptoResult | null; error: string | null }) => {
  if (error) {
    return (
      <Alert
        intent="danger"
        title={error}
      />
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="Encryption results are not available yet."
        icon={<SmallCrossIcon />}
        iconBgColor="tint"
      />
    );
  }

  // TODO [ToDr] Allow editing the name (by default it's "Chunk {id}")
  // TODO [ToDr] Allow adding description.

  return (
    <Slab
      background="tint2"
      display="flex"
    >
      <Pane flex="1">
        <EncryptedMessage encryptedMessage={result.encryptedMessage} />
        <Chunks chunks={result.chunks} />
      </Pane>
      <Card paddingX={majorScale(3)}>
        <Paragraph>
          Store the encrypted message safely and distributed the pieces according to your preference.
        </Paragraph>
        <br />
        <Paragraph>
          Note that encrypted message IS MANDATORY on top of the number of required pieces to restore the original
          message.
        </Paragraph>
      </Card>
    </Slab>
  );
};

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

function Chunks({ chunks }: { chunks: string[] }) {
  const [isShowingQrs, setIsShowingQrs] = useState(false);
  const [activeChunkIdx, setActiveChunkIdx] = useState(0);
  const showDialog = useCallback(
    (id: number) => {
      setActiveChunkIdx(id);
      setIsShowingQrs(true);
    },
    [setActiveChunkIdx, setIsShowingQrs],
  );

  const chunk = chunks[activeChunkIdx];
  const nextChunk = useCallback(() => {
    setActiveChunkIdx((activeChunkIdx + 1) % chunks.length);
  }, [activeChunkIdx, chunks]);
  const prevChunk = useCallback(() => {
    setActiveChunkIdx(activeChunkIdx === 0 ? chunks.length - 1 : activeChunkIdx - 1);
  }, [activeChunkIdx, chunks]);

  const chunkName = (id: number) => `Piece ${id + 1}/${chunks.length}`;
  const activeName = chunkName(activeChunkIdx);

  return (
    <>
      {chunks.map((x: string, idx: number) => (
        <Chunk
          key={x}
          chunk={x}
          id={idx + 1}
          name={chunkName(idx)}
          showDialog={showDialog}
        />
      ))}
      {/* Not using footer, because it's not trivial to align buttons left/right */}
      <Dialog
        isShown={isShowingQrs}
        title={activeName}
        onCloseComplete={() => setIsShowingQrs(false)}
        hasFooter={false}
      >
        {({ close }) => (
          <Pane
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Pane
              display="flex"
              flexDirection="row"
              width="100%"
            >
              <Pane
                flex="1"
                display="flex"
                justifyContent="center"
              >
                <QRWithClipboard value={chunk.toUpperCase()} />
              </Pane>
              <Pane flex="1">
                <TextInputField
                  label="Piece name"
                  value={activeName}
                  autoFocus
                />
                <Button
                  onClick={() => {}}
                  iconBefore={<DownloadIcon />}
                  marginBottom={majorScale(1)}
                >
                  Download
                </Button>
                <br />
                <Button iconBefore={<ManualIcon />}>Certificate</Button>
              </Pane>
            </Pane>
            <Pane
              width="100%"
              display="flex"
              justifyContent="space-between"
              marginY={majorScale(3)}
            >
              <Button
                onClick={prevChunk}
                iconBefore={<ChevronLeftIcon />}
              >
                Prev
              </Button>
              <Button
                appearance="primary"
                onClick={nextChunk}
                iconAfter={<ChevronRightIcon />}
              >
                Next
              </Button>
            </Pane>
          </Pane>
        )}
      </Dialog>
    </>
  );
}

function EncryptedMessage({ encryptedMessage }: { encryptedMessage: string[] }) {
  const [isShowingQr, setIsShowingQr] = useState(false);

  const Footer = ({ close }: Parameters<typeof CloseButton>[0]) => (
    <Group>
      <Button
        onClick={() => {}}
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
            onClick={() => {}}
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
      <Pane
        title={part}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Heading
          size={300}
          textAlign="center"
          marginBottom={majorScale(1)}
        >
          Part {selectedPart + 1} / {data.length}
        </Heading>
        <QRWithClipboard value={part.toUpperCase()} />
        <Group size="small">
          <Button
            onClick={prev}
            disabled={!hasPrev || isPlaying}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={toggle}
            disabled={!hasPrev && !hasNext}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            onClick={next}
            disabled={!hasNext || isPlaying}
          >
            <ChevronRightIcon />
          </Button>
        </Group>
      </Pane>
    </>
  );
}

type ChunkProps = {
  id: number;
  name: string;
  chunk: string;
  showDialog: (a0: number) => void;
};

function Chunk({ id, name, chunk, showDialog }: ChunkProps) {
  // TODO [ToDr] QR code value should rather be a link.
  // TODO [ToDr] turn the heading into editable component.
  return (
    <Slab
      padding={0}
      marginY={majorScale(5)}
      title={chunk}
      display="flex"
    >
      <KeyIcon
        size={majorScale(5)}
        marginRight={majorScale(2)}
      />
      <Pane
        display="flex"
        flexDirection="column"
      >
        <Heading
          marginRight={majorScale(1)}
          marginBottom={majorScale(1)}
        >
          {name}
          <Link
            marginLeft={majorScale(1)}
            href="#"
          >
            <EditIcon />
          </Link>
        </Heading>
        <Group>
          <Button
            iconBefore={<HeatGridIcon />}
            onClick={() => showDialog(id - 1)}
          >
            QR
          </Button>
          <Button iconBefore={<DownloadIcon />}>Download</Button>
          <Button iconBefore={<ManualIcon />}>Certificate</Button>
        </Group>
      </Pane>
    </Slab>
  );
}
