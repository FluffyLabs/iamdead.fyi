import {useEffect, useRef, useCallback} from 'react';

export function useOutsideClick<T extends HTMLElement>(
  callback: () => void,
) {
  const ref = useRef<T>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [ref, handleClick]);

  return ref;
};
