import { Button, Group, Heading, Link, ListItem, majorScale, Pane, Text, UnorderedList } from 'evergreen-ui';
import { useCallback, useState, MouseEvent, ReactNode } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { ProgressBar } from '../../components/progress-bar';
import { MessageEditor } from '../../components/message-editor';
import { FUNNY } from './example-messages';
import { OfflineWarning } from './components/offline-warning';
import { ChunksConfigurationEditor } from './components/chunks-configuration-editor';
import { SecureMessageResult } from './components/secure-message-result';

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
      setStep('encrypt');
    }
  }, [step]);

  const STEPS = {
    encrypt: () => (
      <>
        <ChunksConfigurationEditor configuration={chunksConfiguration} onChange={setChunksConfiguration} />
        <SecureMessageResult chunksConfiguration={chunksConfiguration} message={value} />
      </>
    ),
    editor: () => (
      <>
        <Editor value={value} onChange={handleChange} nextStep={nextStep} />
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

type Steps = 'editor' | 'encrypt';
type ProgressProps = {
  step: Steps;
  setStep: (arg0: Steps) => void;
};

const Progress = ({ step, setStep }: ProgressProps) => {
  const progress = {
    editor: '10%',
    encrypt: '60%',
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
        <Btn step="encrypt">2. Configure encryption</Btn>
      </Group>
    </>
  );
};

type EditorProps = {
  value: string;
  onChange: (a0: string, a1?: boolean) => void;
  nextStep: () => void;
};

const Editor = ({ value, onChange, nextStep }: EditorProps) => {
  return (
    <>
      <Heading marginTop={majorScale(3)}>What message would you like to encrypt?</Heading>
      <Heading size={300} marginTop={majorScale(1)} marginBottom={majorScale(2)}>
        Fell free to start with something basic for now, you will have a chance to edit it any time.
      </Heading>
      <Pane display="flex" padding={0}>
        <Pane padding={0} margin={0} flex="6">
          <MessageEditor value={value} onChange={onChange} />
        </Pane>
        <Pane margin="0" paddingTop="0" flex="2">
          <Text>If you need help writing the message you may try some of the templates below.</Text>
          <UnorderedList>
            <ListItem>
              <Link
                href="#"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  onChange(Examples.funny, true);
                  return false;
                }}
              >
                Funny Text
              </Link>
            </ListItem>
          </UnorderedList>
        </Pane>
      </Pane>
      <Pane display="flex" padding="0" justifyContent="center">
        <Button appearance="primary" size="large" onClick={nextStep}>
          Encrypt the message
        </Button>
      </Pane>
    </>
  );
};
const Examples = {
  funny: FUNNY,
};
