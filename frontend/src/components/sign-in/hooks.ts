import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { axios } from '../../services/axios';
import Cookies from 'js-cookie';

export function useAuthorizationParams() {
  const origin = window.location.origin;
  const state = Math.random().toString().substring(2, 8);

  return {
    redirectUri: `${origin}/login/indie-auth-redirect`,
    clientId: origin,
    state,
  };
}

export function useProfileParams() {
  const { redirectUri, clientId } = useAuthorizationParams();
  const [searchParams] = useSearchParams();

  return {
    clientId,
    redirectUri,
    code: searchParams.get('code'),
  };
}

export function useHasProfileParams() {
  const [searchParams] = useSearchParams();
  return searchParams.has('code') && searchParams.has('state');
}

export function useIndieAuthAuthorization() {
  const hasProfileParams = useHasProfileParams();
  const profileParams = useProfileParams();
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isLoading, error, isSuccess, isError, data } = useQuery({
    queryKey: [],
    queryFn: ({ signal }) => axios.post('/auth/indie-auth/authorize', profileParams, { signal }),
    enabled: hasProfileParams,
  });

  useEffect(() => {
    if (hasProfileParams && (isSuccess || isError)) {
      setSearchParams({});
    }

    if (isSuccess) {
      navigate('/dashboard');
    }
  }, [setSearchParams, hasProfileParams, isSuccess, isError, navigate]);

  useEffect(() => {
    const token: string | undefined = data?.data?.token;
    if (token) {
      Cookies.set('token', token);
    }
  }, [data]);

  return {
    isLoading,
    error,
    isError,
  };
}
