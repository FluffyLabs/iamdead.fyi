import { useEffect, useState } from 'react';

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const onlineListener = () => {
    setIsOnline(true);
  };
  const offlineListener = () => {
    setIsOnline(false);
  };
  useEffect(() => {
    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);
    return () => {
      window.removeEventListener('online', onlineListener);
      window.removeEventListener('offline', offlineListener);
    };
  });

  return isOnline;
};
