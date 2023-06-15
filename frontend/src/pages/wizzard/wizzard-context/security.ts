import { useEffect, useMemo, useState } from 'react';

const DEFAULT_NUMBER_OF_RECIPIENTS = 4;
const DEFAULT_NUMBER_OF_ADDITIONAL_PIECES = 1;

type KeyPiece = {};

type KeyPieces = Array<KeyPiece>;

function createKeyPiece(): KeyPiece {
  return {};
}

function createKeyPieces(noOfPieces: number) {
  return Array.from(Array(noOfPieces).keys()).map(() => createKeyPiece());
}

function changeNoOfKeyPieces(noOfPieces: number, pieces: KeyPieces): KeyPieces {
  if (noOfPieces < pieces.length) {
    return pieces.slice(0, noOfPieces);
  }

  if (noOfPieces > pieces.length) {
    const quantity = noOfPieces - pieces.length;
    const newPieces = createKeyPieces(quantity);
    return [...pieces, ...newPieces];
  }

  return pieces;
}

export function useSecurityStep() {
  const [noOfRecipients, setNoOfRecipients] = useState(
    DEFAULT_NUMBER_OF_RECIPIENTS,
  );
  const [noOfAdditionalPieces, setNoOfAdditionalPieces] = useState(
    DEFAULT_NUMBER_OF_ADDITIONAL_PIECES,
  );

  const [mainKeyPieces, setMainKeyPieces] = useState(() =>
    createKeyPieces(noOfRecipients),
  );
  const [additionalKeyPieces, setAdditionalKeyPieces] = useState(() =>
    createKeyPieces(noOfAdditionalPieces),
  );

  useEffect(() => {
    if (noOfRecipients !== mainKeyPieces.length) {
      const newPieces = changeNoOfKeyPieces(noOfRecipients, mainKeyPieces);
      setMainKeyPieces(newPieces);
    }
  }, [noOfRecipients, mainKeyPieces, setMainKeyPieces]);

  useEffect(() => {
    if (noOfAdditionalPieces !== additionalKeyPieces.length) {
      const newPieces = changeNoOfKeyPieces(
        noOfAdditionalPieces,
        additionalKeyPieces,
      );
      setAdditionalKeyPieces(newPieces);
    }
  }, [noOfAdditionalPieces, additionalKeyPieces]);

  const keyPieces = useMemo(
    () => [...mainKeyPieces, ...additionalKeyPieces],
    [mainKeyPieces, additionalKeyPieces],
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
      keyPieces,
    }),
    [
      noOfRecipients,
      setNoOfRecipients,
      noOfAdditionalPieces,
      setNoOfAdditionalPieces,
      keyPieces,
    ],
  );
}
