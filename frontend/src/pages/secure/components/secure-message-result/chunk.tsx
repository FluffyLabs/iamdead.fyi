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
} from 'evergreen-ui';
import { Slab } from '../../../../components/slab';
import { ChunksMeta } from '../../../../components/piece-view';
import { onDownload } from '../../../../services/download-chunk';

type ChunkProps = {
  chunk: ChunksMeta;
  showDialog: (a0: number) => void;
  onDownload: typeof onDownload;
};

export function Chunk({ chunk, showDialog, onDownload }: ChunkProps) {
  // TODO [ToDr] QR code value should rather be a link.
  return (
    <Slab
      padding={0}
      marginY={majorScale(5)}
      title={chunk.chunk.raw}
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
          onClick={() => showDialog(chunk.chunk.chunkIndex)}
          style={{ cursor: 'pointer' }}
        >
          {chunk.chunk.name}
        </Heading>
        <Group>
          <Button
            iconBefore={<HeatGridIcon />}
            onClick={() => showDialog(chunk.chunk.chunkIndex)}
          >
            QR
          </Button>
          <Button
            iconBefore={<DownloadIcon />}
            onClick={() => onDownload('raw', chunk)}
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
    </Slab>
  );
}
