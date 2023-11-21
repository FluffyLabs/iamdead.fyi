import { useCallback, useState } from 'react';
import { onDownload } from '../services/download-chunk';
import { ChevronDownIcon, DownloadIcon, EditIcon, IconButton, ManualIcon, Menu, Popover, Position } from 'evergreen-ui';
import { PieceDialog } from './piece-dialog';
import { ChunksMeta } from '../hooks/use-chunks';

export type Props<T extends ChunksMeta> = {
  chunk: T;
  onDiscard: (a0: T) => void;
  onNameChange: (a0: T, a1: string) => Promise<string | null>;
  onDescriptionChange: (a0: T, a1: string) => void;
};
export function PieceOptions<T extends ChunksMeta>({ chunk, onDiscard, onNameChange, onDescriptionChange }: Props<T>) {
  const handleDownloadRaw = useCallback(() => onDownload('raw', chunk), [chunk]);
  const handleDownloadCert = useCallback(() => onDownload('certificate', chunk), [chunk]);
  const handleDiscard = useCallback(() => onDiscard(chunk), [chunk, onDiscard]);

  const [isDialogShown, setIsDialogShown] = useState(false);
  return (
    <>
      <PieceDialog
        isShown={isDialogShown}
        chunk={chunk}
        onClose={() => setIsDialogShown(false)}
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
      <Popover
        position={Position.BOTTOM_LEFT}
        content={
          <Menu>
            <Menu.Group>
              <Menu.Item
                icon={<DownloadIcon />}
                onSelect={handleDownloadRaw}
              >
                Download
              </Menu.Item>
              <Menu.Item
                icon={<ManualIcon />}
                onSelect={handleDownloadCert}
              >
                Certificate
              </Menu.Item>
            </Menu.Group>
            <Menu.Divider />
            <Menu.Group>
              <Menu.Item
                icon={<EditIcon />}
                onSelect={() => setIsDialogShown(true)}
              >
                Edit name
              </Menu.Item>
            </Menu.Group>
            <Menu.Divider />
            <Menu.Group>
              <Menu.Item
                onSelect={handleDiscard}
                intent="danger"
              >
                Discard
              </Menu.Item>
            </Menu.Group>
          </Menu>
        }
      >
        <IconButton
          justifySelf="flex-end"
          appearance="minimal"
          icon={<ChevronDownIcon />}
        />
      </Popover>
    </>
  );
}
