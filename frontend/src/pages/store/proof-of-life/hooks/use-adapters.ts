import { getAdapters } from '../../../../services';
import { isMessageAdapter, isSocialAdapter } from '../utils';

export function useAdapters() {
  const adapters = getAdapters();

  return {
    socialMediaAdapters: adapters.filter(isSocialAdapter),
    messageAdapters: adapters.filter(isMessageAdapter),
  };
}
