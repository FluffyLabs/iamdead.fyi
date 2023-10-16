import { getAdapters } from '../../../../services';

export function useAdapters() {
  const adapters = getAdapters();

  return {
    adapters,
  };
}
