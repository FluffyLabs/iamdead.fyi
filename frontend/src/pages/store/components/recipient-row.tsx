import {
  ChevronDownIcon,
  Combobox,
  DownloadIcon,
  EditIcon,
  FormField,
  IconButton,
  ManualIcon,
  Menu,
  Pane,
  Popover,
  Position,
  Switch,
  majorScale,
  minorScale,
  toaster,
} from 'evergreen-ui';
import EmailValidator from 'email-validator';
import { ChangeEvent, useCallback } from 'react';
import { Recipient, MaybeRecipient, NewOrOldRecipient } from './recipients';
import { ChunksMeta, PieceView } from '../../../components/piece-view';
import { onDownload } from '../../../services/download-chunk';

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
  predefinedRecipients: NewOrOldRecipient[];
  recipient: MaybeRecipient;
  setRecipient: (a0: MaybeRecipient) => void;
  isSelected: boolean;
  setIsSelected: (a0: boolean) => void;
  onDiscard: (a0: ChunksMeta) => void;
};

export const RecipientRow = ({
  chunk,
  predefinedRecipients,
  recipient,
  setRecipient,
  isSelected,
  setIsSelected,
  onDiscard,
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
            initialSelectedItem={recipient}
            inputProps={inputProps as any}
            itemToString={(item) => item?.toString()}
            items={predefinedRecipients}
            onChange={setRecipient}
            placeholder="Recipient e-mail"
          />
        )}
      </Pane>
    </PieceView>
  );
};

const PieceOptions = ({ chunk, onDiscard }: { chunk: ChunksMeta; onDiscard: (a0: ChunksMeta) => void }) => {
  const handleDownloadRaw = useCallback(() => onDownload('raw', chunk), [chunk, onDownload]);
  const handleDownloadCert = useCallback(() => onDownload('certificate', chunk), [chunk, onDownload]);
  const handleDiscard = useCallback(() => onDiscard(chunk), [chunk, onDiscard]);
  return (
    <Popover
      position={Position.BOTTOM_LEFT}
      content={
        <Menu>
          <Menu.Group>
            <Menu.Item
              icon={<DownloadIcon />}
              onSelect={handleDownloadRaw}
            >
              Download
            </Menu.Item>
            <Menu.Item
              icon={<ManualIcon />}
              onSelect={handleDownloadCert}
            >
              Certificate
            </Menu.Item>
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group>
            <Menu.Item
              icon={<EditIcon />}
              onSelect={() => toaster.notify('Editing')}
            >
              Edit name
            </Menu.Item>
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group>
            <Menu.Item
              onSelect={handleDiscard}
              intent="danger"
            >
              Discard
            </Menu.Item>
          </Menu.Group>
        </Menu>
      }
    >
      <IconButton
        justifySelf="flex-end"
        appearance="minimal"
        icon={<ChevronDownIcon />}
      />
    </Popover>
  );
};
