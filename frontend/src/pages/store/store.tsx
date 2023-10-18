import { Heading, Pane, Paragraph, Pre, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useLocation } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { Progress } from './components/progress';
import { Intro } from './components/intro';
import { NextStepButton } from '../../components/next-step-button';
import { ProofOfLifeComponent } from './proof-of-life/proof-of-life';
import { Adapter } from '../../services/adapters';
import { ConfiguredAdapter, useProofOfLife } from './proof-of-life/hooks/use-proof-of-life';
import { MaybeRecipient, Recipient, Recipients } from './components/recipients';
import { ChunksConfiguration } from '../../services/crypto';
import { Result as EncryptionResult } from '../secure/components/secure-message-result';

export type Steps = 'recipients' | 'proof-of-life' | 'summary';

export type State = {
  chunksConfiguration: ChunksConfiguration;
  encryptionResult: EncryptionResult;
};

export const Store = () => {
  const { state }: { state: State | null } = useLocation();

  const chunksConfiguration = state?.chunksConfiguration;
  const encryptionResult = state?.encryptionResult;

  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Configure on-line storage & proof of life.
        </Heading>
        {chunksConfiguration && encryptionResult ? (
          <Storage
            chunksConfiguration={chunksConfiguration}
            encryptionResult={encryptionResult}
          />
        ) : (
          <Intro />
        )}
      </Container>
    </>
  );
};

function isValid(recipient: MaybeRecipient) {
  if (recipient === null) {
    return true;
  }

  if (typeof recipient !== 'string') {
    return false;
  }

  if (recipient.trim() === '') {
    return true;
  }

  return false;
}

const Storage = ({
  chunksConfiguration,
  encryptionResult,
}: {
  chunksConfiguration: ChunksConfiguration;
  encryptionResult: EncryptionResult;
}) => {
  const [step, setStep] = useState('recipients' as Steps);
  const nextStep = useCallback(() => {
    if (step === 'recipients') {
      setStep('proof-of-life');
    }
    if (step === 'proof-of-life') {
      setStep('summary');
    }
  }, [step, setStep]);

  const initialChunks = useMemo(() => {
    return encryptionResult.chunks.map((chunk) => ({
      chunk,
      isSelected: false,
      recipient: null as MaybeRecipient,
    }));
  }, [encryptionResult.chunks]);

  const [chunks, setChunks] = useState(initialChunks);
  const [predefinedRecipients] = useState([
    new Recipient(1, 'Mommy', 'mommy@home.com'),
    new Recipient(2, 'Dad', 'dad@home.com'),
    new Recipient(3, 'Wife', 'wife@home.com'),
  ]);
  const proofOfLife = useProofOfLife();

  const isNextStepActive = (() => {
    if (step === 'recipients') {
      return chunks.filter((x) => x.isSelected && isValid(x.recipient)).length === 0;
    }
    if (step === 'proof-of-life') {
      return proofOfLife.listOfAdapters.length > 0;
    }
    if (step === 'summary') {
      return true;
    }
  })();

  const STEPS = {
    recipients: () => (
      <>
        <Recipients
          chunks={chunks}
          setChunks={setChunks}
          requiredChunks={chunksConfiguration.required}
          messageBytes={encryptionResult.encryptedMessageBytes}
          predefinedRecipients={predefinedRecipients}
        />
        <NextStepButton
          nextStep={nextStep}
          disabled={!isNextStepActive}
        >
          Configure Proof of Life
        </NextStepButton>
      </>
    ),
    'proof-of-life': () => (
      <>
        <ProofOfLife proofOfLife={proofOfLife} />
        <NextStepButton
          nextStep={nextStep}
          disabled={!isNextStepActive}
        >
          Sign in to save the setup
        </NextStepButton>
      </>
    ),
    summary: () => (
      <>
        <Pre>
          {JSON.stringify(
            chunks.filter((x) => x.isSelected),
            null,
            2,
          )}
        </Pre>
        <Pre>
          {JSON.stringify(
            proofOfLife.listOfAdapters.map((x) =>
              x.map((y) => ({
                id: y.id,
                name: y.name,
                months: y.months,
              })),
            ),
            null,
            2,
          )}
        </Pre>
      </>
    ),
  };

  return (
    <>
      <Progress
        step={step}
        setStep={setStep}
        isNextStepActive={isNextStepActive}
      />
      <Pane marginTop={majorScale(3)}>{STEPS[step]()}</Pane>
    </>
  );
};

const ProofOfLife = ({ proofOfLife }: { proofOfLife: ReturnType<typeof useProofOfLife> }) => {
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
    ({ item, groupIndex, itemIndex }: { item: ConfiguredAdapter | null; groupIndex: number; itemIndex: number }) => {
      if (item === null) {
        proofOfLife.removeFromGroup(groupIndex, itemIndex);
      } else {
        proofOfLife.updateGroupItem(item, groupIndex, itemIndex);
      }
    },
    [proofOfLife],
  );

  return (
    <>
      <Paragraph>
        Decide under what conditions the pieces will be distributed to the recipients. More detailed configuration will
        be available after you sign in.
      </Paragraph>

      <ProofOfLifeComponent
        adapters={proofOfLife.listOfAdapters}
        addNewAdapterGroup={addNewAdapterGroup}
        addToGroup={addToGroup}
        updateGroupItem={updateGroupItem}
      />
    </>
  );
};
