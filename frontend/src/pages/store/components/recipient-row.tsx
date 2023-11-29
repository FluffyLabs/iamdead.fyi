import { Combobox, Pane, Switch, majorScale, minorScale } from 'evergreen-ui';
import EmailValidator from 'email-validator';
import { ChangeEvent, useCallback } from 'react';
import { PieceView } from '../../../components/piece-view';
import { PieceOptions } from '../../../components/piece-options';
import { ChunkStorage } from '../store';
import { MaybeRecipient, NewOrOldRecipient } from '../../../hooks/user/use-recipients';

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
  chunk: ChunkStorage;
  predefinedRecipients: NewOrOldRecipient[];
  recipient: MaybeRecipient;
  setRecipient: (a0: MaybeRecipient) => void;
  isSelected: boolean;
  setIsSelected: (a0: boolean) => void;
  onDiscard: (a0: ChunkStorage) => void;
  onNameChange: (a0: ChunkStorage, a1: string) => Promise<string | null>;
  onDescriptionChange: (a0: ChunkStorage, a1: string) => void;
};

export const RecipientRow = ({
  chunk,
  predefinedRecipients,
  recipient,
  setRecipient,
  isSelected,
  setIsSelected,
  onDiscard,
  onNameChange,
  onDescriptionChange,
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

  const inputProps = {
    spellCheck: false,
    autoFocus: true,
    isInvalid: !isRecipientValid,
  };

  return (
    <PieceView
      chunk={chunk}
      firstLine={
        <Switch
          hasCheckIcon
          display="inline-block"
          height={minorScale(5)}
          checked={isSelected}
          onChange={handleSelected}
          marginLeft={majorScale(2)}
          position="relative"
          top={minorScale(1)}
        />
      }
      appendix={
        <PieceOptions
          chunk={chunk}
          onDiscard={onDiscard}
          onNameChange={onNameChange}
          onDescriptionChange={onDescriptionChange}
        />
      }
    >
      <Pane
        display="flex"
        flex="1"
        alignItems="center"
      >
        {isSelected && (
          <Combobox
            marginLeft={majorScale(2)}
            autocompleteProps={{ allowOtherValues: true }}
            inputProps={inputProps as any}
            itemToString={(item) => item?.toString()}
            items={predefinedRecipients}
            onChange={setRecipient}
            selectedItem={recipient || ''}
            placeholder="Recipient e-mail"
          />
        )}
      </Pane>
    </PieceView>
  );
};
