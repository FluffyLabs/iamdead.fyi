import { createContext, useContext, useMemo, useState } from 'react';

type WizzardContext = ReturnType<typeof useWizzard>;
const wizzardContext = createContext<ReturnType<typeof useWizzard>>(
  null as unknown as WizzardContext,
);

export const WizzardContextProvider = wizzardContext.Provider;

export function useWizzardContext() {
  return useContext(wizzardContext);
}

const DEFAULT_NUMBER_OF_RECIPIENTS = 4;
const DEFAULT_NUMBER_OF_ADDITIONAL_PIECES = 1;

function useSecurityStep() {
  const [noOfRecipients, setNoOfRecipients] = useState(
    DEFAULT_NUMBER_OF_RECIPIENTS,
  );
  const [noOfAdditionalPieces, setNoOfAdditionalPieces] = useState(
    DEFAULT_NUMBER_OF_ADDITIONAL_PIECES,
  );

  return useMemo(
    () => ({
      noOfRecipients: {
        value: noOfRecipients,
        setValue: setNoOfRecipients,
      },
      noOfAdditionalPieces: {
        value: noOfAdditionalPieces,
        setValue: setNoOfAdditionalPieces,
      },
    }),
    [
      noOfRecipients,
      setNoOfRecipients,
      noOfAdditionalPieces,
      setNoOfAdditionalPieces,
    ],
  );
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