import {
  Heading,
  Pane,
  majorScale,
  Group,
  Button,
  HeatGridIcon,
  KeyIcon,
  DownloadIcon,
  ManualIcon,
  toaster,
} from 'evergreen-ui';
import { Slab } from '../../../../components/slab';
import { Chunk as ChunkT } from '../../../../services/crypto';
import { useCallback } from 'react';

type ChunkProps = {
  chunk: ChunkT;
  showDialog: (a0: number) => void;
};

export function Chunk({ chunk, showDialog }: ChunkProps) {
  // TODO [ToDr] QR code value should rather be a link.

  const handleCertificate = useCallback(() => {
    toaster.notify('Downloading certificate is not implemented yet.');
  }, []);

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
          <Button
            iconBefore={<ManualIcon />}
            onClick={handleCertificate}
          >
            Certificate
          </Button>
        </Group>
      </Pane>
    </Slab>
  );
}
