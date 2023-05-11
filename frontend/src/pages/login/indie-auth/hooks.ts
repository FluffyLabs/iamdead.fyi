import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function useAuthorizationParams() {
  const origin = window.location.origin;
  const state = Math.random().toString().substring(2, 8);

  return {
    redirectUri: `${origin}/login/indie-auth-redirect`,
    clientId: origin,
    state,
  }
}

export function useProfileParams() {
  const { redirectUri, clientId } = useAuthorizationParams();
  const [searchParams] = useSearchParams();

  return {
    client_id: clientId,
    redirect_uri: redirectUri,
    code: searchParams.get('code'),
  };
}

export function useHasProfileParams() {
  const [searchParams] = useSearchParams();
  return searchParams.has('code') && searchParams.has('state')
}

export function useIndieAuthAuthorization() {
  const hasProfileParams = useHasProfileParams();
  const profileParams  = useProfileParams();
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isLoading, error, isSuccess, isError } = useQuery([], ({ signal }) =>
    fetch('/auth/indie-auth/authorize', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileParams),
      signal,
    }).then(res => {
      if (res.ok) {
        return Promise.resolve({}); // 204 - no content
      }
      return res.json();
    }), {
      enabled: hasProfileParams,
    }
  )

  useEffect(() => {
    if (hasProfileParams && (isSuccess || isError)) {
        setSearchParams({});
    } 
    
    if (isSuccess) {
      navigate('/');
    }
  }, [setSearchParams, hasProfileParams, isSuccess, isError, navigate]);

  return {
    isLoading,
    error,
    isError
  }
}