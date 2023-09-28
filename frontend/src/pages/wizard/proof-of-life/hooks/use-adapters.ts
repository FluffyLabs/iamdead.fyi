import { useQuery } from '@tanstack/react-query';

import { getAdapters } from '../../../../services';
import { isMessageAdapter, isSocialAdapter } from '../utils';

export function useAdapters() {
  return useQuery([], () => {
    return getAdapters().then((adapters) => ({
      socialMediaAdapters: adapters.filter(isSocialAdapter),
      messageAdapters: adapters.filter(isMessageAdapter),
    }));
  });
}
