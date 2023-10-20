import { Checkbox, Combobox, InlineAlert, Pane, majorScale } from 'evergreen-ui';
import EmailValidator from 'email-validator';
import { ChangeEvent, useCallback } from 'react';
import { Recipient, MaybeRecipient } from './recipients';
import { ChunksMeta, PieceView } from '../../../components/piece-view';

function isEmailAddress(val: string) {
  const emailStart = val.indexOf('<');
  const emailEnd = val.indexOf('>');
  if (emailStart !== -1 && emailEnd !== -1) {
    return EmailValidator.validate(val.substring(emailStart + 1, emailEnd));
  }
  if (emailStart === -1 && emailEnd === -1) {
    return EmailValidator.validate(val);
  }
  return false;
}

type Props = {
  chunk: ChunksMeta;
  predefinedRecipients: Recipient[];
  recipient: MaybeRecipient;
  setRecipient: (a0: MaybeRecipient) => void;
  isSelected: boolean;
  setIsSelected: (a0: boolean) => void;
};

export const RecipientRow = ({
  chunk,
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
    <PieceView chunk={chunk}>
      <Checkbox
        marginLeft={majorScale(2)}
        checked={isSelected}
        onChange={handleSelected}
      />
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
    </PieceView>
  );
};
