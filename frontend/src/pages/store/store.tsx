import { Alert, Checkbox, Heading, LockIcon, Paragraph, Position, Tooltip, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useLocation } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { Progress } from './components/progress';
import { Intro } from './components/intro';
// TODO [ToDr] Move the type to some other place?
import { ChunksMeta } from '../secure/components/secure-message-result/secure-message-result';
import { Slab } from '../../components/slab';
import { Row } from './components/row';
import { RecipientRow } from './components/recipient-row';
import { NextStepButton } from '../../components/next-step-button';
import { ProofOfLifeComponent } from './proof-of-life/proof-of-life';
import { Adapter } from '../../services/adapters';
import { ConfiguredAdapter, useProofOfLife } from './proof-of-life/hooks/use-proof-of-life';

export type Steps = 'recipients' | 'proof-of-life';

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

export const Store = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading size={700} marginBottom={majorScale(5)}>
          Configure on-line account & proof of life.
        </Heading>
        <Storage />
      </Container>
    </>
  );
};

const Storage = () => {
  const { state } = useLocation();

  const [step, setStep] = useState('recipients' as Steps);
  const [chunks] = useState(state?.encryptionResult?.chunks);
  const [predefinedRecipients] = useState([
    new Recipient(1, 'Mommy', 'mommy@home.com'),
    new Recipient(2, 'Dad', 'dad@home.com'),
    new Recipient(3, 'Wife', 'wife@home.com'),
  ]);

  const nextStep = useCallback(() => {
    if (step === 'recipients') {
      setStep('proof-of-life');
    }
  }, [step, setStep]);

  if (!state) {
    return <Intro />;
  }

  const STEPS = {
    recipients: () => (
      <>
        <Recipients
          chunks={chunks}
          requiredChunks={state.chunksConfiguration?.required}
          messageBytes={state.encryptionResult?.encryptedMessageBytes}
          predefinedRecipients={predefinedRecipients}
        />
        <NextStepButton nextStep={nextStep}>Configure Proof of Life</NextStepButton>
      </>
    ),
    'proof-of-life': () => (
      <>
        <ProofOfLife />
      </>
    ),
  };

  return (
    <>
      <Progress step={step} setStep={setStep} />
      {STEPS[step]()}
    </>
  );
};

type RecipientsProps = {
  chunks: ChunksMeta[];
  requiredChunks: number;
  messageBytes: number;
  predefinedRecipients: Recipient[];
};

function newArray<T>(len: number, v: T) {
  return Array(len).map(() => v);
}

const Recipients = ({ chunks, requiredChunks, messageBytes, predefinedRecipients }: RecipientsProps) => {
  const total = chunks.length;
  const [isSelected, setIsSelected] = useState(newArray(total, false));
  const [recipients, setRecipients] = useState(newArray(total, null as Recipient | string | null));

  const handleSelected = useCallback(
    (idx: number, v: boolean) => {
      isSelected[idx] = v;
      setIsSelected([...isSelected]);
    },
    [isSelected],
  );
  const handleRecipient = useCallback(
    (idx: number, v: Recipient | string | null) => {
      recipients[idx] = v;
      setRecipients([...recipients]);
    },
    [recipients],
  );

  const selectedCount = isSelected.filter((x) => x).length;
  return (
    <Slab marginTop={0}>
      <Paragraph>
        Select only pieces that you wish to store to your on-line account and have them delivered to recipients. The
        remaining pieces will be available to download as a <strong>recovery key</strong>.
      </Paragraph>
      <EncryptedMessageRow messageBytes={messageBytes} />
      {chunks.map((chunk, idx) => (
        <RecipientRow
          key={idx}
          chunk={chunk}
          idx={idx}
          total={total}
          predefinedRecipients={predefinedRecipients}
          recipient={recipients[idx]}
          isSelected={isSelected[idx]}
          setIsSelected={(v) => handleSelected(idx, v)}
          setRecipient={(v) => handleRecipient(idx, v)}
        />
      ))}
      {selectedCount >= requiredChunks && <TooManyPiecesWarning count={selectedCount} limit={requiredChunks} />}
    </Slab>
  );
};

const TooManyPiecesWarning = ({ count, limit }: { count: number; limit: number }) => {
  return (
    <Alert intent="warning" title="😱 We can read your message!" marginTop={majorScale(3)}>
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
      <Heading size={400} marginLeft={majorScale(2)}>
        Encrypted message ({messageBytes} bytes)
      </Heading>
      <Tooltip content={'Storing the encrypted message is currently mandatory.'} position={Position.TOP}>
        <Checkbox marginLeft={majorScale(2)} disabled checked />
      </Tooltip>
    </Row>
  );
};

const ProofOfLife = () => {
  const proofOfLife = useProofOfLife();

  const addNewAdapterGroup = useCallback(
    ({ adapter }: { adapter: Adapter }) => {
      proofOfLife.addNewGroup({ ...adapter, months: 2 });
    },
    [proofOfLife],
  );

  const addToGroup = useCallback(
    ({ adapter, groupIndex }: { adapter: Adapter; groupIndex: number }) => {
      proofOfLife.addToGroup({ ...adapter, months: 2 }, groupIndex);
    },
    [proofOfLife],
  );

  const updateGroupItem = useCallback(
    ({ item, groupIndex, itemIndex }: { item: ConfiguredAdapter; groupIndex: number; itemIndex: number }) => {
      proofOfLife.updateGroupItem(item, groupIndex, itemIndex);
    },
    [proofOfLife],
  );

  return (
    <>
      <Slab marginTop={0}>
        <Paragraph>Decide under what conditions the pieces will be distributed to the recipients.</Paragraph>
        <ProofOfLifeComponent
          adapters={proofOfLife.listOfAdapters}
          addNewAdapterGroup={addNewAdapterGroup}
          addToGroup={addToGroup}
          updateGroupItem={updateGroupItem}
        />
      </Slab>
    </>
  );
};
