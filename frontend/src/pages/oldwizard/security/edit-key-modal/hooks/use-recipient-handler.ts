import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useWizardContext } from '../../../wizard-context';

type Option = {
  label: string;
  value: string;
};

export function useRecipientHandler(cardId: number) {
  const { security } = useWizardContext();
  const [isNewRecipient, setNewRecipient] = useState(false);
  const options = useMemo(
    () =>
      security.recipients.map((recipient) => ({
        label: recipient.name,
        value: recipient.email,
      })),
    [security.recipients],
  );
  const [currentRecipient, setCurrentRecipient] = useState<Option | null>(() => {
    const recipient = security.keyPieces[cardId].recipient;
    if (!recipient) {
      return null;
    }
    return {
      label: recipient.name,
      value: recipient.email,
    };
  });
  const onCreate = useCallback(
    (label: string) => {
      const newRecipient = { label, value: '' };
      setNewRecipient(true);
      setCurrentRecipient(newRecipient);
    },
    [setNewRecipient],
  );

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentRecipient((prev) => ({
        label: prev!.label,
        value: e.target.value,
      }));
    },
    [setCurrentRecipient],
  );

  const onChange = useCallback(
    (newValue: Option | null) => {
      setNewRecipient(false);
      setCurrentRecipient(newValue);
    },
    [setNewRecipient],
  );

  return {
    isNewRecipient,
    options,
    currentRecipient,
    handleEmailChange,
    onCreate,
    onChange,
  };
}
