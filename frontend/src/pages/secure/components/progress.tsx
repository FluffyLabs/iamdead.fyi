import { Button, Group, majorScale } from 'evergreen-ui';
import { ReactNode } from 'react';
import { ProgressBar } from '../../../components/progress-bar';
import { Steps } from '../secure';

type ProgressProps = {
  step: Steps;
  setStep: (arg0: Steps) => void;
};

export const Progress = ({ step, setStep }: ProgressProps) => {
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
        minWidth="200px"
        marginBottom={majorScale(1)}
      >
        {children}
      </Button>
    );
  };

  return (
    <>
      <ProgressBar progress={progress[step]} />
      <Group
        display="flex"
        flexWrap="wrap"
      >
        <Btn step="editor">1. Prepare the message</Btn>
        <Btn step="chunks">2. Configure encryption</Btn>
        <Btn step="encrypt">3. Encrypt the message</Btn>
      </Group>
    </>
  );
};
