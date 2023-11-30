import { useQuery } from '@tanstack/react-query';
import { axios } from '../../services/axios';

export type UserAdapter = {
  id: string;
  handle: string;
};

export function useAdapters() {
  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: ['adapters'],
    queryFn: ({ signal }) => axios.get('/api/me/adapters', { signal }),
    retry: false,
  });

  const adapters: UserAdapter[] = data?.data || [];

  return {
    adapters,
    isLoading,
    isSuccess,
    error,
  };
}
