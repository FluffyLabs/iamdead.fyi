import { Pre } from 'evergreen-ui';
import { ChunkStorage } from '../store';
import { ConfiguredAdapter } from '../services/adapters';

type Props = {
  listOfAdapters: ConfiguredAdapter[][];
  gracePeriod: number;
  chunks: ChunkStorage[];
};

export const Summary = ({ listOfAdapters, gracePeriod, chunks }: Props) => {
  return (
    <>
      <Pre>
        {JSON.stringify(
          chunks.filter((x) => x.isSelected),
          null,
          2,
        )}
      </Pre>
      <Pre>
        {JSON.stringify(
          listOfAdapters.map((x) =>
            x.map((y) => ({
              id: y.id,
              name: y.name,
              months: y.months,
            })),
          ),
          null,
          2,
        )}
      </Pre>
    </>
  );
};
