import { Checkbox, Combobox, Heading, KeyIcon, Pane, majorScale } from 'evergreen-ui';
import { ChunksMeta } from '../../secure/components/secure-message-result/secure-message-result';
import { Row } from './row';
import { Recipient } from '../store';
import { ChangeEvent, useCallback } from 'react';

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
            inputProps={{ spellCheck: false, autoFocus: true, autoComplete: 'email' } as any}
            itemToString={(item) => item?.toString()}
            items={predefinedRecipients}
            marginLeft={majorScale(2)}
            onChange={setRecipient}
            openOnFocus
            placeholder="Recipient e-mail"
          />
        </Pane>
      )}
    </Row>
  );
};
