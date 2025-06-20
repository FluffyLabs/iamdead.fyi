import { useCallback } from 'react';
import { Alert, Button, ImportIcon, Link, Pane, Paragraph, Position, Switch, Tooltip, majorScale } from 'evergreen-ui';
import { RecipientRow } from './recipient-row';
import { EncryptedMessageView } from '../../../components/encrypted-message-view';
import { ChunksApi } from '../../../hooks/use-chunks';
import { ChunkStorage } from '../store';
import { MaybeRecipient, NewOrOldRecipient } from '../../../hooks/user/use-recipients';

type RecipientsProps = {
  chunksApi: ChunksApi<ChunkStorage>;
  requiredChunks: number;
  totalChunks: number;
  messageBytes: number;
  predefinedRecipients: NewOrOldRecipient[];
  onScanMore: () => void;
};

export const Recipients = ({
  chunksApi,
  requiredChunks,
  totalChunks,
  messageBytes,
  predefinedRecipients,
  onScanMore,
}: RecipientsProps) => {
  const { chunks, setChunks, discardChunk, changeName, changeDescription } = chunksApi;
  const handleSelected = useCallback(
    (idx: number, v: boolean) => {
      chunks[idx].isSelected = v;
      setChunks([...chunks]);
    },
    [chunks, setChunks],
  );

  const handleRecipient = useCallback(
    (idx: number, v: MaybeRecipient) => {
      chunks[idx].recipient = v;
      setChunks([...chunks]);
    },
    [chunks, setChunks],
  );

  const selectedCount = chunks.filter((x) => x.isSelected).length;

  // TODO [ToDr] Make storing encrypted message optional. in such case
  // it has to be provided separately for recovery.
  return (
    <>
      <Paragraph>
        Select only pieces that you wish to store to your on-line account and have them delivered to recipients. The
        remaining pieces will be available to download as a <strong>recovery key</strong>.
      </Paragraph>
      <Paragraph>
        You will be able to configure more details about recipients after signing in. If you already have an account,{' '}
        <Link href="#">sign in now</Link>.
      </Paragraph>
      <EncryptedMessageView messageBytes={messageBytes}>
        <Tooltip
          content={'Storing the encrypted message is currently mandatory.'}
          position={Position.TOP}
        >
          <Switch
            marginLeft={majorScale(2)}
            disabled
            checked
          />
        </Tooltip>
      </EncryptedMessageView>
      {chunks.map((chunk, idx) => (
        <RecipientRow
          key={idx}
          chunk={chunk}
          predefinedRecipients={predefinedRecipients}
          recipient={chunk.recipient}
          isSelected={chunk.isSelected}
          setIsSelected={(v) => handleSelected(idx, v)}
          setRecipient={(v) => handleRecipient(idx, v)}
          onDiscard={discardChunk}
          onNameChange={changeName}
          onDescriptionChange={changeDescription}
        />
      ))}
      {chunks.length < totalChunks && (
        <Pane
          display="flex"
          justifyContent="flex-end"
        >
          <Button
            iconBefore={<ImportIcon />}
            onClick={onScanMore}
          >
            Import more
          </Button>
        </Pane>
      )}
      {selectedCount >= requiredChunks && (
        <TooManyPiecesWarning
          count={selectedCount}
          limit={requiredChunks}
        />
      )}
    </>
  );
};

const TooManyPiecesWarning = ({ count, limit }: { count: number; limit: number }) => {
  return (
    <Alert
      intent="warning"
      title="😱 We can read your message!"
      marginTop={majorScale(3)}
    >
      <Paragraph>
        You've selected {count} pieces to be stored on-line, while {limit} is enough to decrypt the message.
      </Paragraph>
      <Paragraph>
        Your message will not be safe with us, please consider storing only up to {limit - 1} pieces.
      </Paragraph>
    </Alert>
  );
};
