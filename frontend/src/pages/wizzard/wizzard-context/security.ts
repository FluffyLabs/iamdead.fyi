import { useMemo, useState } from 'react';

const DEFAULT_NUMBER_OF_RECIPIENTS = 4;
const DEFAULT_NUMBER_OF_ADDITIONAL_PIECES = 1;

export function useSecurityStep() {
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
