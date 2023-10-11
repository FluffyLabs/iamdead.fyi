import { Checkbox, Combobox, Heading, InlineAlert, KeyIcon, Pane, majorScale } from 'evergreen-ui';
import EmailValidator from 'email-validator';
import { ChunksMeta } from '../../secure/components/secure-message-result/secure-message-result';
import { Row } from './row';
import { Recipient } from '../store';
import { ChangeEvent, useCallback } from 'react';

function isEmailAddress(val: string) {
  return EmailValidator.validate(val);
}

type MaybeRecipient = Recipient | string | null;

type Props = {
  chunk: ChunksMeta;
  idx: number;
  total: number;
  predefinedRecipients: Recipient[];
  recipient: MaybeRecipient;
  setRecipient: (a0: MaybeRecipient) => void;
  isSelected: boolean;
  setIsSelected: (a0: boolean) => void;
};

export const RecipientRow = ({
  chunk,
  idx,
  total,
  predefinedRecipients,
  recipient,
  setRecipient,
  isSelected,
  setIsSelected,
}: Props) => {
  const handleSelected = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setIsSelected(!!ev.target.checked);
    },
    [setIsSelected],
  );

  const isRecipientValid = (() => {
    if (recipient === null) {
      return false;
    }
    if (typeof recipient === 'string') {
      return recipient.trim() !== '' && isEmailAddress(recipient);
    }
    return true;
  })();
  const isNewRecipient = typeof recipient === 'string' && isRecipientValid;

  const inputProps = {
    spellCheck: false,
    autoFocus: true,
    isInvalid: !isRecipientValid,
  };
  return (
    <Row>
      <KeyIcon size={majorScale(5)} />
      <Heading size={400} marginLeft={majorScale(2)}>
        {idx + 1}/{total}
      </Heading>
      <Heading size={400} marginLeft={majorScale(2)}>
        {chunk.name}
      </Heading>
      <Checkbox marginLeft={majorScale(2)} checked={isSelected} onChange={handleSelected} />
      {isSelected && (
        <Pane width="400px">
          <Combobox
            autocompleteProps={{ allowOtherValues: true }}
            initialSelectedItem={recipient}
            inputProps={inputProps as any}
            itemToString={(item) => item?.toString()}
            items={predefinedRecipients}
            marginLeft={majorScale(2)}
            onChange={setRecipient}
            openOnFocus
            placeholder="Recipient e-mail"
          />
        </Pane>
      )}
      {isSelected && isNewRecipient && <InlineAlert intent="info">A new recipient will be created.</InlineAlert>}
    </Row>
  );
};
