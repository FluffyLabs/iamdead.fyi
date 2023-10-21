import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
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
  Card,
  Paragraph,
  TextareaField,
} from 'evergreen-ui';
import { useSecureMessage } from '../../../../hooks/use-secure-message';
import { ChunksConfiguration, Chunk as ChunkT } from '../../../../services/crypto';
import { Summary } from './summary';
import { QRWithClipboard } from './qr-with-clipboard';
import { Slab } from '../../../../components/slab';
import { ChunksMeta } from '../../../../components/piece-view';
import { encryptedMessageBytes } from '../../../../components/encrypted-message-view';
import { UserDefined } from '../../secure';

export type Props = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
  result: Result | null;
  setResult: (a0: Result | null) => void;
  userDefined: UserDefined[];
  setUserDefined: (a0: UserDefined[]) => void;
};

export type Result = {
  encryptedMessage: string[];
  encryptedMessageBytes: number;
  chunks: ChunksMeta[];
};

export const SecureMessageResult = ({
  message,
  chunksConfiguration,
  result,
  setResult,
  userDefined,
  setUserDefined,
}: Props) => {
  const {
    secureMessage,
    result: localResult,
    error,
    isLoading,
    alterChunkName,
    alterChunkNameError,
  } = useSecureMessage();
  const userDefinedRef = useRef(userDefined);

  // call secure message every time message or configuration changes
  useEffect(() => {
    // Note, we don't want to re-call secureMessage on name change,
    // hence using ref here.
    const names = userDefinedRef.current.map((x) => x.name);
    secureMessage(message, chunksConfiguration, names);
  }, [message, chunksConfiguration, secureMessage, userDefinedRef]);

  const handleChunkNameChange = useCallback(
    (chunkIndex: number, newName: string) => {
      if (userDefined[chunkIndex]?.name === newName || localResult?.chunks[chunkIndex].name === newName) {
        return;
      }

      alterChunkName(chunkIndex, newName).then((isNameOk: boolean) => {
        if (isNameOk) {
          userDefined[chunkIndex] = {
            name: newName,
            description: userDefined[chunkIndex]?.description || '',
          };
          const newUserDefined = [...userDefined];
          setUserDefined(newUserDefined);
          userDefinedRef.current = newUserDefined;
        }
      });
    },
    [userDefined, setUserDefined, alterChunkName, userDefinedRef, localResult],
  );

  const handleChunkDescritptionChange = useCallback(
    (chunkIndex: number, newDescription: string) => {
      userDefined[chunkIndex] = {
        name: userDefined[chunkIndex]?.name,
        description: newDescription,
      };

      setUserDefined([...userDefined]);
    },
    [userDefined, setUserDefined],
  );

  // propagate updated results up
  // TODO [ToDr] Re-use old names & re-use descriptions.
  useEffect(() => {
    if (!localResult) {
      setResult(localResult);
      return;
    }

    const { encryptedMessage } = localResult;
    const chunks = localResult.chunks.map((c, idx) => ({
      description: userDefined[idx]?.description || '',
      chunk: c,
    }));
    setResult({
      encryptedMessage,
      encryptedMessageBytes: encryptedMessageBytes(encryptedMessage),
      chunks,
    });
  }, [localResult, setResult, userDefined]);

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
        onChunkNameChange={handleChunkNameChange}
        chunkNameChangeError={alterChunkNameError}
        onChunkDescriptionChange={handleChunkDescritptionChange}
      />
    </>
  );
};

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

const DisplayResult = ({
  result,
  error,
  onChunkNameChange,
  chunkNameChangeError,
  onChunkDescriptionChange,
}: {
  result: Result | null;
  error: string | null;
  onChunkNameChange: (chunkIndex: number, newName: string) => void;
  chunkNameChangeError?: string;
  onChunkDescriptionChange: (chunkIndex: number, newDescription: string) => void;
}) => {
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

  return (
    <Slab
      background="tint2"
      display="flex"
    >
      <Pane flex="1">
        <EncryptedMessage encryptedMessage={result.encryptedMessage} />
        <Chunks
          chunks={result.chunks}
          onNameChange={onChunkNameChange}
          nameChangeError={chunkNameChangeError}
          onDescriptionChange={onChunkDescriptionChange}
        />
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

function Chunks({
  chunks,
  onNameChange,
  nameChangeError,
  onDescriptionChange,
}: {
  chunks: ChunksMeta[];
  onNameChange: (chunkIndex: number, name: string) => void;
  nameChangeError?: string;
  onDescriptionChange: (chunkIndex: number, description: string) => void;
}) {
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

  const [activeName, setActiveName] = useState(chunk.chunk.name);
  // reset activeName when activeChunk changes
  useEffect(() => {
    setActiveName(chunk.chunk.name);
  }, [chunk, setActiveName]);

  const handleActiveNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setActiveName(e.target.value);
    },
    [setActiveName],
  );
  const handleNameChange = useCallback(() => {
    onNameChange(activeChunkIdx, activeName);
  }, [activeName, activeChunkIdx, onNameChange]);
  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onDescriptionChange(activeChunkIdx, e.target.value);
    },
    [activeChunkIdx, onDescriptionChange],
  );

  return (
    <>
      {chunks.map((x: ChunksMeta) => (
        <Chunk
          key={x.chunk.chunkIndex}
          chunk={x.chunk}
          showDialog={showDialog}
        />
      ))}
      {/* Not using footer, because it's not trivial to align buttons left/right */}
      <Dialog
        isShown={isShowingQrs}
        title={chunk.chunk.name}
        onCloseComplete={() => setIsShowingQrs(false)}
        hasFooter={false}
      >
        {() => (
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
                alignItems="center"
                flexDirection="column"
                paddingX={majorScale(2)}
              >
                <QRWithClipboard value={chunk.chunk.raw.toUpperCase()} />
                <Group marginTop={majorScale(2)}>
                  <Button
                    onClick={() => {}}
                    iconBefore={<DownloadIcon />}
                    marginBottom={majorScale(1)}
                  >
                    Download
                  </Button>
                  <Button iconBefore={<ManualIcon />}>Certificate</Button>
                </Group>
              </Pane>
              <Pane flex="1">
                <TextInputField
                  label="Piece name"
                  value={activeName}
                  onChange={handleActiveNameChange}
                  onBlur={handleNameChange}
                  isInvalid={!!nameChangeError}
                  validationMessage={nameChangeError}
                  autoFocus
                />
                <TextareaField
                  label="Extended description"
                  hint="The description is only visible in the certificate."
                  value={chunk.description}
                  onChange={handleDescriptionChange}
                />
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

  const prev = useCallback(
    () => (selectedPart > 0 ? setSelectedPart(selectedPart - 1) : setSelectedPart(data.length - 1)),
    [data, selectedPart],
  );
  const next = useCallback(() => {
    setSelectedPart((selectedPart + 1) % data.length);
  }, [selectedPart, data.length]);

  const toggle = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const id = isPlaying ? window.setInterval(next, 1000) : null;
    return () => {
      if (id) {
        window.clearInterval(id);
      }
    };
  }, [isPlaying, next]);

  const needsNav = data.length > 1;

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
        <Group
          size="small"
          marginTop={majorScale(2)}
        >
          <Button
            onClick={prev}
            disabled={!needsNav || isPlaying}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={toggle}
            disabled={!needsNav}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            onClick={next}
            disabled={!needsNav || isPlaying}
          >
            <ChevronRightIcon />
          </Button>
        </Group>
      </Pane>
    </>
  );
}

type ChunkProps = {
  chunk: ChunkT;
  showDialog: (a0: number) => void;
};

function Chunk({ chunk, showDialog }: ChunkProps) {
  // TODO [ToDr] QR code value should rather be a link.
  return (
    <Slab
      padding={0}
      marginY={majorScale(5)}
      title={chunk.raw}
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
          onClick={() => showDialog(chunk.chunkIndex)}
          style={{ cursor: 'pointer' }}
        >
          {chunk.name}
        </Heading>
        <Group>
          <Button
            iconBefore={<HeatGridIcon />}
            onClick={() => showDialog(chunk.chunkIndex)}
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
