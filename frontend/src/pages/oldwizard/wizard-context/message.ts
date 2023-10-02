import { useMemo, useState } from 'react';

export function useMessage() {
  const [value, setValue] = useState('');

  return useMemo(
    () => ({
      value,
      setValue,
    }),
    [value, setValue],
  );
}
