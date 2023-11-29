import { useEffect, useState } from 'react';

export function useBufferedSynced<S>({
  syncValue,
  initialValue,
  bufferBy = 200,
}: {
  syncValue: S;
  initialValue?: S;
  bufferBy?: number;
}) {
  const val = initialValue !== undefined ? initialValue : syncValue;
  const [bufferedState, setBufferedState] = useState(val);

  useEffect(() => {
    const id = setTimeout(() => {
      setBufferedState(syncValue);
    }, bufferBy);

    return () => {
      clearTimeout(id);
    };
  }, [syncValue, setBufferedState, bufferBy]);

  return bufferedState;
}

export function useBufferedState<S>(initialValue: S, bufferBy: number = 200) {
  const [state, setState] = useState(initialValue);
  const bufferedState = useBufferedSynced({
    syncValue: state,
    bufferBy,
  });

  return [bufferedState, setState];
}
