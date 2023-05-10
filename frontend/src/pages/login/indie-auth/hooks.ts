import { useLocation, useSearchParams } from 'react-router-dom';

export function useAuthorizationParams() {
  const { pathname } = useLocation();
  const origin = window.location.origin
  const state = Math.random().toString().substring(2, 8); // should be stored somewhere to survive redirect 

  return {
    redirectUri: `${origin}${pathname}-redirect`,
    clientId: origin,
    state,
  }
}

export function useProfileParams() {
  const { redirectUri, clientId, state: originalState } = useAuthorizationParams();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code'); 
  const state = searchParams.get('state'); 
  const me = searchParams.get('me'); 

  if (state !== originalState) {
    // error - currently it is always true as state param is not stored
  }

  return {
    clientId,
    redirectUri,
    code
  };
}