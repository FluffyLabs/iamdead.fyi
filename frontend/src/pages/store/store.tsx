import { CrossIcon, Dialog, Heading, IconButton, Pane, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { Progress } from './components/progress';
import { Intro } from './components/intro';
import { NextStepButton } from '../../components/next-step-button';
import { Adapter, ConfiguredAdapter } from './services/adapters';
import { ProofOfLife } from './components/proof-of-life/proof-of-life';
import { useProofOfLife } from './hooks/use-proof-of-life';
import { MaybeRecipient, NewOrOldRecipient, Recipient, Recipients } from './components/recipients';
import { ChunksConfiguration } from '../../services/crypto';
import { Result as EncryptionResult } from '../secure/components/secure-message-result';
import { Summary } from './components/summary';
import { SignIn } from '../../components/sign-in/sign-in';
import { uniq } from 'lodash';
import { ChunksMeta, useChunks } from '../../hooks/use-chunks';

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

export type ChunkStorage = ChunksMeta & {
  isSelected: boolean;
  recipient: MaybeRecipient;
};

const Storage = ({
  chunksConfiguration,
  encryptionResult,
}: {
  chunksConfiguration: ChunksConfiguration;
  encryptionResult: EncryptionResult;
}) => {
  const [step, setStep] = useState('recipients' as Steps);
  const [showLogin, setShowLogin] = useState(false);

  const nextStep = useCallback(() => {
    if (step === 'recipients') {
      setStep('proof-of-life');
    }
    if (step === 'proof-of-life') {
      setStep('summary');
    }
    if (step === 'summary') {
      setShowLogin(true);
    }
  }, [step, setStep, setShowLogin]);

  const initialChunks = useMemo(() => {
    return encryptionResult.chunks.map(
      (chunk) =>
        ({
          ...chunk,
          isSelected: true,
          recipient: null,
        }) as ChunkStorage,
    );
  }, [encryptionResult.chunks]);

  const { chunks, setChunks } = useChunks(initialChunks);
  const [predefinedRecipients] = useState([
    new Recipient(1, 'Mommy', 'mommy@home.com'),
    new Recipient(2, 'Dad', 'dad@home.com'),
    new Recipient(3, 'Wife', 'wife@home.com'),
  ]);
  const proofOfLife = useProofOfLife();
  const navigate = useNavigate();

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

  const selectableRecipients = useMemo(() => {
    const configuredRecipients = chunks.filter((x) => x.recipient).map((x) => x.recipient as NewOrOldRecipient);

    return uniq([...predefinedRecipients, ...configuredRecipients]);
  }, [predefinedRecipients, chunks]);

  const handleScanMore = useCallback(() => {
    navigate('/scan', {
      state: {
        chunksConfiguration,
        encryptionResult: {
          ...encryptionResult,
          chunks: chunks.map((c) => c.chunk),
        },
      },
    });
  }, [navigate, chunksConfiguration, chunks, encryptionResult]);

  const STEPS = {
    recipients: () => (
      <>
        <Recipients
          chunks={chunks}
          setChunks={setChunks}
          requiredChunks={chunksConfiguration.required}
          totalChunks={chunksConfiguration.required + chunksConfiguration.spare}
          messageBytes={encryptionResult.encryptedMessageBytes}
          predefinedRecipients={selectableRecipients}
          onScanMore={handleScanMore}
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
        <ProofOfLifeWrapper proofOfLife={proofOfLife} />
        <NextStepButton
          nextStep={nextStep}
          disabled={!isNextStepActive}
        >
          Summarize the setup
        </NextStepButton>
      </>
    ),
    summary: () => (
      <>
        <Summary
          listOfAdapters={proofOfLife.listOfAdapters}
          gracePeriod={proofOfLife.gracePeriod}
          chunks={chunks.filter((x) => x.isSelected)}
        />
        <NextStepButton
          nextStep={nextStep}
          disabled={!isNextStepActive}
        >
          Sign in to proceed
        </NextStepButton>
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
      <Dialog
        isShown={showLogin}
        hasFooter={false}
        hasHeader={false}
      >
        <SignIn
          header={
            <Pane
              display="flex"
              justifyContent="flex-end"
              marginY={majorScale(1)}
              width="100%"
            >
              <IconButton
                appearance="minimal"
                icon={<CrossIcon />}
                onClick={() => setShowLogin(false)}
              />
            </Pane>
          }
        />
      </Dialog>
    </>
  );
};

const ProofOfLifeWrapper = ({ proofOfLife }: { proofOfLife: ReturnType<typeof useProofOfLife> }) => {
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
    <ProofOfLife
      adapters={proofOfLife.listOfAdapters}
      addNewAdapterGroup={addNewAdapterGroup}
      addToGroup={addToGroup}
      updateGroupItem={updateGroupItem}
      gracePeriod={proofOfLife.gracePeriod}
      setGracePeriod={proofOfLife.setGracePeriod}
    />
  );
};
