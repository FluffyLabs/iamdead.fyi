import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  Pane,
  majorScale,
  Group,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Dialog,
  DownloadIcon,
  ManualIcon,
  TextInputField,
  TextareaField,
  toaster,
} from 'evergreen-ui';
import { ChunksMeta } from '../../../../components/piece-view';
import { Chunk } from './chunk';
import { QRWithClipboard } from '../../../../components/qr-with-clipboard';

export function onDownload(kind: 'certificate' | 'raw', chunk: ChunksMeta) {
  if (kind === 'certificate') {
    toaster.notify('Downloading certificate is not implemented yet.');
    return;
  }

  const blob = new Blob([chunk.chunk.raw], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.download = `${chunk.chunk.name}.icod.txt`;
  // Trigger a click event on the anchor element
  a.click();
  URL.revokeObjectURL(url);
}

export function Chunks({
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
          chunk={x}
          showDialog={showDialog}
          onDownload={onDownload}
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
              flexWrap="wrap"
            >
              <Pane
                flex="1"
                display="flex"
                alignItems="center"
                flexDirection="column"
                paddingX={majorScale(2)}
                marginBottom={majorScale(3)}
              >
                <QRWithClipboard value={chunk.chunk.raw.toUpperCase()} />
                <Group marginTop={majorScale(2)}>
                  <Button
                    onClick={() => onDownload('raw', chunk)}
                    iconBefore={<DownloadIcon />}
                    marginBottom={majorScale(1)}
                  >
                    Download
                  </Button>
                  <Button
                    iconBefore={<ManualIcon />}
                    onClick={() => onDownload('certificate', chunk)}
                  >
                    Certificate
                  </Button>
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
