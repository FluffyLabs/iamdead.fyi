import { createContext, useContext, useMemo } from 'react';
import { useSecurityStep } from './security';
import { useProofOfLifeStep } from './proof-of-life';
import { useMessage } from './message';

type WizardContext = ReturnType<typeof useWizard>;

const wizardContext = createContext<ReturnType<typeof useWizard>>(null as unknown as WizardContext);

export const WizardContextProvider = wizardContext.Provider;

export function useWizardContext() {
  return useContext(wizardContext);
}

export function useWizard() {
  const security = useSecurityStep();
  const proofOfLife = useProofOfLifeStep();
  const message = useMessage();

  return useMemo(
    () => ({
      security,
      proofOfLife,
      message,
    }),
    [security, proofOfLife, message],
  );
}
