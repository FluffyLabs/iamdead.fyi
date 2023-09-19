import { createContext, useContext, useMemo } from 'react';
import { useSecurityStep } from './security';
import { useProofOfLifeStep } from './proof-of-life';

type WizardContext = ReturnType<typeof useWizard>;

const wizardContext = createContext<ReturnType<typeof useWizard>>(null as unknown as WizardContext);

export const WizardContextProvider = wizardContext.Provider;

export function useWizardContext() {
  return useContext(wizardContext);
}

export function useWizard() {
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
