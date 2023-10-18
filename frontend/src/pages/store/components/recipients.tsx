import { useCallback } from 'react';
import { ChunksMeta } from '../../secure/components/secure-message-result/secure-message-result';
import { Alert, Checkbox, Heading, Link, LockIcon, Paragraph, Position, Tooltip, majorScale } from 'evergreen-ui';
import { Row } from './row';
import { RecipientRow } from './recipient-row';

export class Recipient {
  id: number;
  name: string;
  email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }

  // TODO [ToDr] To overcome issues with evergreen Combobox component
  trim() {
    this.toString().trim();
  }
}

export type MaybeRecipient = Recipient | string | null;

type Chunks = {
  chunk: ChunksMeta;
  isSelected: boolean;
  recipient: MaybeRecipient;
}[];

type RecipientsProps = {
  chunks: Chunks;
  setChunks: (arg0: Chunks) => void;
  requiredChunks: number;
  messageBytes: number;
  predefinedRecipients: Recipient[];
};

export const Recipients = ({
  chunks,
  setChunks,
  requiredChunks,
  messageBytes,
  predefinedRecipients,
}: RecipientsProps) => {
  const total = chunks.length;

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
  return (
    <>
      <Paragraph>
        Select only pieces that you wish to store to your on-line account and have them delivered to recipients. The
        remaining pieces will be available to download as a <strong>recovery key</strong>.
      </Paragraph>
      <Paragraph>
        If you already have an account, <Link href="#">sign in now</Link>.
      </Paragraph>
      <EncryptedMessageRow messageBytes={messageBytes} />
      {chunks.map((chunk, idx) => (
        <RecipientRow
          key={idx}
          chunk={chunk.chunk}
          idx={idx}
          total={total}
          predefinedRecipients={predefinedRecipients}
          recipient={chunk.recipient}
          isSelected={chunk.isSelected}
          setIsSelected={(v) => handleSelected(idx, v)}
          setRecipient={(v) => handleRecipient(idx, v)}
        />
      ))}
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

const EncryptedMessageRow = ({ messageBytes }: { messageBytes: number }) => {
  // TODO [ToDr] Make storing encrypted message optional. in such case
  // it has to be provided separately for recovery.
  return (
    <Row>
      <LockIcon size={majorScale(5)} />
      <Heading
        size={400}
        marginLeft={majorScale(2)}
      >
        Encrypted message ({messageBytes} bytes)
      </Heading>
      <Tooltip
        content={'Storing the encrypted message is currently mandatory.'}
        position={Position.TOP}
      >
        <Checkbox
          marginLeft={majorScale(2)}
          disabled
          checked
        />
      </Tooltip>
    </Row>
  );
};
