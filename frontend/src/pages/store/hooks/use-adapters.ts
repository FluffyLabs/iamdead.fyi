import { getAdapters } from '../services/adapters';

export function useAdapters() {
  const adapters = getAdapters();

  return {
    adapters,
  };
}
