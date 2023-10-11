import { Button, Group } from 'evergreen-ui';
import { Steps } from '../store';
import { ProgressBar } from '../../../components/progress-bar';
import { ReactNode } from 'react';

type ProgressProps = {
  step: Steps;
  setStep: (arg0: Steps) => void;
};

export const Progress = ({ step, setStep }: ProgressProps) => {
  const progress = {
    recipients: '10%',
    'proof-of-life': '70%',
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
        <Btn step="recipients">1. Recipients</Btn>
        <Btn step="proof-of-life">2. Proof of Life</Btn>
      </Group>
    </>
  );
};
