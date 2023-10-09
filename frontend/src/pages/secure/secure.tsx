import { Button, ChevronRightIcon, Group } from 'evergreen-ui';
import { useCallback, useState, ReactNode } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { ProgressBar } from '../../components/progress-bar';
import { OfflineWarning } from './components/offline-warning';
import { ChunksConfigurationEditor } from './components/chunks-configuration-editor';
import { SecureMessageResult } from './components/secure-message-result';
import { Editor } from './components/editor';
import { Slab } from '../../components/slab';

const useEditorState = () => {
  const [value, setValue] = useState('');
  const [isPristine, setIsPristine] = useState(true);

  const handleChange = useCallback(
    (newVal: string, forced: boolean = false) => {
      if (forced && !isPristine) {
        // TODO [ToDr] Consider using some react confirmation dialog instead.
        const confirmed = window.confirm('This action will overwrite your message.');
        if (!confirmed) {
          return;
        }
      }

      // TODO [ToDr] Figure out why the handleChange fires twice and why there are changes in the example.
      if (value !== newVal) {
        setValue(newVal);
        setIsPristine(!!forced);
      }
    },
    [value, isPristine],
  );

  return { value, handleChange };
};

export const Secure = () => {
  const { value, handleChange } = useEditorState();
  const [step, setStep] = useState('editor' as Steps);
  const [chunksConfiguration, setChunksConfiguration] = useState({
    required: 2,
    spare: 1,
  });
  const nextStep = useCallback(() => {
    if (step === 'editor') {
      setStep('chunks');
    }
    if (step === 'chunks') {
      setStep('encrypt');
    }
  }, [step]);

  const STEPS = {
    encrypt: () => (
      <>
        <SecureMessageResult chunksConfiguration={chunksConfiguration} message={value} />
        <NextStepButton nextStep={nextStep}>Store pieces & configure distribution</NextStepButton>
      </>
    ),
    chunks: () => (
      <>
        <ChunksConfigurationEditor configuration={chunksConfiguration} onChange={setChunksConfiguration} />
        <NextStepButton nextStep={nextStep}>Encrypt the message</NextStepButton>
      </>
    ),
    editor: () => (
      <>
        <Editor value={value} onChange={handleChange} />
        <NextStepButton nextStep={nextStep}>Configure the encryption</NextStepButton>
      </>
    ),
  };

  return (
    <>
      <Navigation />
      <Container>
        <OfflineWarning />
        <Progress step={step} setStep={setStep} />
        {STEPS[step]()}
      </Container>
    </>
  );
};

const NextStepButton = ({ nextStep, children }: { nextStep: () => void; children: ReactNode }) => {
  return (
    <Slab display="flex" padding="0" justifyContent="center">
      <Button iconAfter={<ChevronRightIcon />} appearance="primary" size="large" onClick={nextStep}>
        {children}
      </Button>
    </Slab>
  );
};

type Steps = 'editor' | 'encrypt' | 'chunks';
type ProgressProps = {
  step: Steps;
  setStep: (arg0: Steps) => void;
};

const Progress = ({ step, setStep }: ProgressProps) => {
  const progress = {
    editor: '10%',
    chunks: '40%',
    encrypt: '90%',
  };

  // TODO [ToDr] Validate random step transitions?
  const Btn = ({ step: myStep, children }: { step: Steps; children: ReactNode }) => {
    return (
      <Button
        flex="1"
        appearance={step === myStep ? 'primary' : undefined}
        onClick={() => setStep(myStep)}
        justifyContent="left"
      >
        {children}
      </Button>
    );
  };

  return (
    <>
      <ProgressBar progress={progress[step]} />
      <Group display="flex">
        <Btn step="editor">1. Prepare the message</Btn>
        <Btn step="chunks">2. Configure encryption</Btn>
        <Btn step="encrypt">3. Encrypt the message</Btn>
      </Group>
    </>
  );
};
