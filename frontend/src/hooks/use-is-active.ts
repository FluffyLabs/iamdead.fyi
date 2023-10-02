import { useLocation } from 'react-router-dom';

export const useIsActive = (to: string) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || (pathname.startsWith(to) && pathname.charAt(to.length) === '/');

  return isActive;
};
