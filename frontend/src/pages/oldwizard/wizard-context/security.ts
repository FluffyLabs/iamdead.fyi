import { useCallback, useEffect, useMemo, useState } from 'react';
import { Recipient, Recipients } from '../common/types';

const DEFAULT_NUMBER_OF_RECIPIENTS = 4;
const DEFAULT_NUMBER_OF_ADDITIONAL_PIECES = 1;

type KeyPiece = { recipient?: Recipient; note?: string };

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
  const [noOfRecipients, setNoOfRecipients] = useState(DEFAULT_NUMBER_OF_RECIPIENTS);
  const [noOfAdditionalPieces, setNoOfAdditionalPieces] = useState(DEFAULT_NUMBER_OF_ADDITIONAL_PIECES);

  const [mainKeyPieces, setMainKeyPieces] = useState(() => createKeyPieces(noOfRecipients));
  const [additionalKeyPieces, setAdditionalKeyPieces] = useState(() => createKeyPieces(noOfAdditionalPieces));

  const keyPieces = useMemo(() => [...mainKeyPieces, ...additionalKeyPieces], [mainKeyPieces, additionalKeyPieces]);

  const [recipients, setRecipients] = useState<Recipients>([]);

  const createRecipient = useCallback(
    (newRecipient: Recipient) => {
      setRecipients((currentRecipients) => [...currentRecipients, newRecipient]);
    },
    [setRecipients],
  );

  const updateKeyPieces = useCallback(
    function <T extends keyof KeyPiece>(cardId: number, key: T, value: KeyPiece[T]) {
      const keyPiecesCopy = [...keyPieces];
      keyPiecesCopy[cardId][key] = value;
      setMainKeyPieces(keyPiecesCopy.slice(0, mainKeyPieces.length));
      setAdditionalKeyPieces(keyPiecesCopy.slice(mainKeyPieces.length));
    },
    [setMainKeyPieces, setAdditionalKeyPieces, keyPieces, mainKeyPieces],
  );

  const addRecipient = useCallback(
    (newRecipient: Recipient, cardId: number) => {
      updateKeyPieces(cardId, 'recipient', newRecipient);
    },
    [updateKeyPieces],
  );

  const addNote = useCallback(
    (note: string, cardId: number) => {
      updateKeyPieces(cardId, 'note', note);
    },
    [updateKeyPieces],
  );

  useEffect(() => {
    if (noOfRecipients !== mainKeyPieces.length) {
      const newPieces = changeNoOfKeyPieces(noOfRecipients, mainKeyPieces);
      setMainKeyPieces(newPieces);
    }
  }, [noOfRecipients, mainKeyPieces, setMainKeyPieces]);

  useEffect(() => {
    if (noOfAdditionalPieces !== additionalKeyPieces.length) {
      const newPieces = changeNoOfKeyPieces(noOfAdditionalPieces, additionalKeyPieces);
      setAdditionalKeyPieces(newPieces);
    }
  }, [noOfAdditionalPieces, additionalKeyPieces]);

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
      recipients,
      addRecipient,
      addNote,
      createRecipient,
    }),
    [
      noOfRecipients,
      setNoOfRecipients,
      noOfAdditionalPieces,
      setNoOfAdditionalPieces,
      keyPieces,
      recipients,
      addRecipient,
      addNote,
      createRecipient,
    ],
  );
}
