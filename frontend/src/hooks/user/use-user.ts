import { useQuery } from '@tanstack/react-query';
import { axios } from '../../services/axios';

export function useUser() {
  const { isLoading, error, data, isSuccess } = useQuery({
    queryKey: ['user'],
    queryFn: ({ signal }) => axios.get('/api/me', { signal }),
  });

  const me = data?.data;

  return {
    me,
    isLogged: !!me,
    isLoading,
    isSuccess,
    error,
  };
}
