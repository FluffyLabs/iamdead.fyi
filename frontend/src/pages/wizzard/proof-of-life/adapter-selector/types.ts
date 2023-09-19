import { Adapters } from '../../wizzard-context/proof-of-life';

export type AdapterItem = {
  name: string;
  image: string;
  value: Adapters;
};

export type SelectedAdapter = {
  value: Adapters;
  id: string;
};
