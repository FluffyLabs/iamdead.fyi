import { useCallback, useState } from 'react';

import { useWizardContext } from '../wizard-context';
import { KeyPerson } from '../icons';
import { Key } from '../icons';
import { DraggableNumber } from '../../../components/draggable-number';
import { MULTIPLICATION_CHAR } from '../common/consts';
import { Cards } from '../common/components/cards';
import { Recipient } from '../common/types';
import { Row } from './row';
import { OneRecipient } from './one-recipient';
import { ManyRecipients } from './many-recipients';
import { MAX_NO_OF_RECIPIENTS, MIN_NO_OF_RECIPIENTS } from './consts';
import { EditKeyModal } from './edit-key-modal';

export const Security = () => {
  const { security } = useWizardContext();
  const [editedCardId, setEditedCardId] = useState<number>(-1);
  const closeModal = useCallback(() => setEditedCardId(-1), [setEditedCardId]);
  const onSave = useCallback(
    (recipient: Recipient, cardId: number, note: string, isNewRecipient: boolean) => {
      closeModal();
      if (isNewRecipient) {
        security.createRecipient(recipient);
      }
      security.addRecipient(recipient, cardId);
      security.addNote(note, cardId);
    },
    [closeModal, security],
  );

  return (
    <div>
      <Row
        Icon={KeyPerson}
        counter={
          <>
            {MULTIPLICATION_CHAR}
            <DraggableNumber
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={MIN_NO_OF_RECIPIENTS}
              max={MAX_NO_OF_RECIPIENTS}
            />
          </>
        }
      >
        <>
          I want any{' '}
          <DraggableNumber
            value={security.noOfRecipients.value}
            onChange={security.noOfRecipients.setValue}
            min={MIN_NO_OF_RECIPIENTS}
            max={MAX_NO_OF_RECIPIENTS}
          />
          recipients to come together to read the message
        </>
      </Row>

      <Row
        Icon={Key}
        counter={
          <>
            +
            <DraggableNumber
              value={security.noOfAdditionalPieces.value}
              onChange={security.noOfAdditionalPieces.setValue}
            />
          </>
        }
      >
        <>
          For redundancy I want {security.noOfRecipients.value === 1 && <OneRecipient />}
          {security.noOfRecipients.value > 1 && <ManyRecipients />}
        </>
      </Row>

      <Cards onClick={setEditedCardId} />
      {editedCardId >= 0 && <EditKeyModal cardId={editedCardId} onCancel={closeModal} onConfirm={onSave} />}
    </div>
  );
};
