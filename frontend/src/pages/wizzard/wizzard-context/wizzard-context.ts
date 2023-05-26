import { createContext, useContext, useMemo } from 'react';
import { useSecurityStep } from './security';

type WizzardContext = ReturnType<typeof useWizzard>;

const wizzardContext = createContext<ReturnType<typeof useWizzard>>(
  null as unknown as WizzardContext,
);

export const WizzardContextProvider = wizzardContext.Provider;

export function useWizzardContext() {
  return useContext(wizzardContext);
}

export function useWizzard() {
  const security = useSecurityStep();

  return useMemo(
    () => ({
      security,
    }),
    [security],
  );
}
