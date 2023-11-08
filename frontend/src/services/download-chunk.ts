import { toaster } from 'evergreen-ui';
import { downloadFile } from './download-file';
import { ChunksMeta } from '../components/piece-view';

export function onDownload(kind: 'certificate' | 'raw', chunk: ChunksMeta) {
  if (kind === 'certificate') {
    toaster.notify('Downloading certificate is not implemented yet.');
    return;
  }

  downloadFile([chunk.chunk.raw], 'text/plain', `${chunk.chunk.name}.icod.txt`);
}
