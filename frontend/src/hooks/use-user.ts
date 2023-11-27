import { useQuery } from '@tanstack/react-query';
import { axios } from '../services/axios';

export function useUser() {
  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: [],
    queryFn: ({ signal }) => axios.get('/api/users/me', { signal }),
  });

  return {
    me: data?.data,
    isLoading,
    isSuccess,
    error,
  };
}
