import {
  Button,
  Dialog,
  DownloadIcon,
  Group,
  ManualIcon,
  Pane,
  TextInputField,
  TextareaField,
  majorScale,
} from 'evergreen-ui';
import { QRWithClipboard } from './qr-with-clipboard';
import { onDownload } from '../services/download-chunk';
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { ChunksMeta } from '../hooks/use-chunks';

export type Props<T extends ChunksMeta> = {
  isShown: boolean;
  chunk: T;
  children?: ReactNode;
  onClose: () => void;
  onNameChange: (a0: T, a1: string) => Promise<string | null>;
  onDescriptionChange: (a0: T, a1: string) => void;
};
export function PieceDialog<T extends ChunksMeta>({
  isShown,
  chunk,
  onClose,
  children,
  onNameChange,
  onDescriptionChange,
}: Props<T>) {
  const [nameChangeError, setNameChangeError] = useState(null as string | null);
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

  const handleNameChange = useCallback(
    (newName: string) => {
      onNameChange(chunk, newName)
        .then((err) => {
          setNameChangeError(err);
        })
        .catch((e) => {
          setNameChangeError(e.message);
        });
    },
    [chunk, onNameChange, setNameChangeError],
  );

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onDescriptionChange(chunk, e.target.value);
    },
    [onDescriptionChange, chunk],
  );

  // Not using footer, because it's not trivial to align buttons left/right
  return (
    <Dialog
      isShown={isShown}
      title={chunk.chunk.name}
      onCloseComplete={onClose}
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
                onBlur={() => handleNameChange(activeName)}
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
          {children}
        </Pane>
      )}
    </Dialog>
  );
}
