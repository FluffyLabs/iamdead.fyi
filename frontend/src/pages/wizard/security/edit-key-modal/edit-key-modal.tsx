import { useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import { clsx } from 'clsx';
import { Dialog } from 'evergreen-ui';

import { Recipient } from '../../common/types';
import { useRecipientHandler } from './hooks/use-recipient-handler';
import { useNoteHandler } from './hooks/use-note-handler';

import styles from './styles.module.scss';

type Props = {
  cardId: number;
  onConfirm: (recipient: Recipient, cardId: number, note: string, isNewRecipient: boolean) => void;
  onCancel: () => void;
};

export const EditKeyModal = ({ cardId, onConfirm, onCancel }: Props) => {
  const { note, handleNoteChange } = useNoteHandler(cardId);
  const { isNewRecipient, currentRecipient, onChange, onCreate, options, handleEmailChange } =
    useRecipientHandler(cardId);

  const handleSave = useCallback(() => {
    const newRecipient: Recipient = {
      name: currentRecipient?.label!,
      email: currentRecipient?.value!,
    };

    onConfirm?.(newRecipient, cardId, note, isNewRecipient);
  }, [note, currentRecipient, cardId, isNewRecipient, onConfirm]);

  return (
    <Dialog
      isShown
      title={`Edit key ${cardId + 1}`}
      onCloseComplete={handleSave}
      confirmLabel="Confirm"
      onCancel={onCancel}
    >
      <div>
        <div className={styles.inputRow}>
          <label>Recipient: </label>
          <CreatableSelect
            isClearable
            className={styles.input}
            onCreateOption={onCreate}
            onChange={onChange}
            options={options}
            value={currentRecipient}
          />
        </div>

        {isNewRecipient && (
          <div className={styles.inputRow}>
            <label>E-mail: </label>
            <input
              type="email"
              className={clsx(styles.note, styles.input)}
              onChange={handleEmailChange}
              value={currentRecipient?.value}
            />
          </div>
        )}

        <div className={styles.inputRow}>
          <label>Note: </label>
          <textarea className={clsx(styles.note, styles.input)} value={note} onChange={handleNoteChange} />
        </div>
      </div>
    </Dialog>
  );
};
