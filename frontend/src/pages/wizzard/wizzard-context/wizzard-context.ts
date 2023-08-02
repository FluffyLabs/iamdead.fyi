import { createContext, useContext, useMemo } from 'react';
import { useSecurityStep } from './security';
import { useProofOfLifeStep } from './proof-of-life';

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
  const proofOfLife = useProofOfLifeStep();
  return useMemo(
    () => ({
      security,
      proofOfLife,
    }),
    [security, proofOfLife],
  );
}
