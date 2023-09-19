import { clsx } from 'clsx';
import { ChangeEvent, ComponentType, SVGProps, useCallback, useMemo, useState } from 'react';

import { useWizardContext } from '../wizard-context';
import { KeyPerson } from '../icons';
import { Key } from '../icons';
import { DraggableNumberInput } from '../../../components/draggable-number-input';
import { MULTIPLICATION_CHAR } from '../common/consts';

import { Cards } from '../common/components/cards';

import styles from './styles.module.scss';
import { Modal } from '../../../components/modal';
import { ModalProps } from '../../../components/modal/modal';
import CreatableSelect from 'react-select/creatable';
import { Recipient } from '../common/types';

const MIN_NO_OF_RECIPIENTS = 1;
const MAX_NO_OF_RECIPIENTS = 9;
const MIN_NO_OF_ADDITIONAL_PIECES = 0;
const MAX_NO_OF_ADDITIONAL_PIECES = 9;

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
            <DraggableNumberInput
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={MIN_NO_OF_RECIPIENTS}
              max={MAX_NO_OF_RECIPIENTS}
            />
          </>
        }
        text={
          <>
            I want any{' '}
            <DraggableNumberInput
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={MIN_NO_OF_RECIPIENTS}
              max={MAX_NO_OF_RECIPIENTS}
            />
            recipients to come together to read the message
          </>
        }
      />

      <Row
        Icon={Key}
        counter={
          <>
            +
            <DraggableNumberInput
              value={security.noOfAdditionalPieces.value}
              onChange={security.noOfAdditionalPieces.setValue}
            />
          </>
        }
        text={
          <>
            For redundancy I want {security.noOfRecipients.value === 1 && <OneRecipient />}
            {security.noOfRecipients.value > 1 && <ManyRecipients />}
          </>
        }
      />

      <Cards onClick={setEditedCardId} />
      {editedCardId >= 0 && <EditKeyModal cardId={editedCardId} onCancel={closeModal} onConfirm={onSave} />}
    </div>
  );
};

const Row = ({
  Icon,
  counter,
  text,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  counter: JSX.Element;
  text: JSX.Element;
}) => {
  return (
    <div className="flex flex-row items-center">
      <span className="flex flex-row w-52 justify-around">
        <Icon style={{ width: '100px', height: '100px' }} />
        <span style={{ fontSize: '50px', marginLeft: '5px' }}>{counter}</span>
      </span>
      <span className="mx-5">{text}</span>
    </div>
  );
};

const OneRecipient = () => {
  const { security } = useWizardContext();

  return (
    <>
      <DraggableNumberInput
        value={security.noOfAdditionalPieces.value}
        onChange={security.noOfAdditionalPieces.setValue}
        max={MAX_NO_OF_ADDITIONAL_PIECES}
        min={MIN_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      extra keys
    </>
  );
};

const ManyRecipients = () => {
  const { security } = useWizardContext();

  const handleNoOfPiecesChange = useCallback(
    (val: number) => {
      security.noOfAdditionalPieces.setValue(val - security.noOfRecipients.value);
    },
    [security.noOfAdditionalPieces, security.noOfRecipients],
  );
  return (
    <>
      <DraggableNumberInput
        value={security.noOfAdditionalPieces.value + security.noOfRecipients.value}
        onChange={handleNoOfPiecesChange}
        min={security.noOfRecipients.value}
        max={security.noOfRecipients.value + MAX_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      pieces to be distributed
    </>
  );
};

type Option = {
  label: string;
  value: string;
};

type EditKeyModalProps = {
  cardId: number;
  onConfirm: (recipient: Recipient, cardId: number, note: string, isNewRecipient: boolean) => void;
} & Partial<Omit<ModalProps, 'onConfirm'>>;

function useNoteHandler(cardId: number) {
  const { security } = useWizardContext();

  const [note, setNote] = useState<string>(() => security.keyPieces[cardId].note ?? '');

  const handleNoteChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value), [setNote]);

  return {
    note,
    handleNoteChange,
  };
}

function useRecipientHandler(cardId: number) {
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

const EditKeyModal = ({ cardId, onConfirm, ...modalProps }: EditKeyModalProps) => {
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
    <Modal {...modalProps} title={`Edit key ${cardId + 1}`} onConfirm={handleSave}>
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
    </Modal>
  );
};
