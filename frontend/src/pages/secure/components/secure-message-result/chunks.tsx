import { useCallback, useState } from 'react';
import { Pane, majorScale, Button, ChevronLeftIcon, ChevronRightIcon } from 'evergreen-ui';
import { Chunk } from './chunk';
import { PieceDialog } from '../../../../components/piece-dialog';
import { ChunksMeta } from '../../../../hooks/use-chunks';

export function Chunks({
  chunks,
  onNameChange,
  onDescriptionChange,
}: {
  chunks: ChunksMeta[];
  onNameChange: (chunkIndex: number, name: string) => Promise<string | null>;
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

  const handleNameChange = useCallback(
    (_chunk: ChunksMeta, newName: string) => {
      return onNameChange(activeChunkIdx, newName);
    },
    [activeChunkIdx, onNameChange],
  );

  const handleDescriptionChange = useCallback(
    (_chunk: ChunksMeta, description: string) => {
      onDescriptionChange(activeChunkIdx, description);
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
        />
      ))}

      <PieceDialog
        isShown={isShowingQrs}
        onClose={() => setIsShowingQrs(false)}
        chunk={chunk}
        onNameChange={handleNameChange}
        onDescriptionChange={handleDescriptionChange}
      >
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
      </PieceDialog>
    </>
  );
}
