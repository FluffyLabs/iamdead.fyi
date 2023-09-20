import { ChangeEvent, useCallback, useState } from 'react';

import { useWizardContext } from '../../../wizard-context';

export function useNoteHandler(cardId: number) {
  const { security } = useWizardContext();

  const [note, setNote] = useState<string>(() => security.keyPieces[cardId].note ?? '');

  const handleNoteChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value), [setNote]);

  return {
    note,
    handleNoteChange,
  };
}
