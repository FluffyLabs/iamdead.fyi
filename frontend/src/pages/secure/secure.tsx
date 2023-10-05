import {
  Alert,
  Button,
  Group,
  Heading,
  KeyIcon,
  Link,
  ListItem,
  majorScale,
  NewPersonIcon,
  Pane,
  Text,
  TextInputField,
  UnorderedList,
} from 'evergreen-ui';
import { useCallback, useState, MouseEvent, ReactNode, ChangeEvent, useMemo } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { ProgressBar } from '../../components/progress-bar';
import { MessageEditor } from '../../components/message-editor';
import { FUNNY } from './example_messages';
import { useIsOnline } from '../../hooks/use-is-online';
import {
  MAX_NO_OF_ADDITIONAL_PIECES,
  MAX_NO_OF_RECIPIENTS,
  MIN_NO_OF_ADDITIONAL_PIECES,
  MIN_NO_OF_RECIPIENTS,
} from '../oldwizard/security/consts';
import { DraggableNumberInput } from '../../components/draggable-number-input';
import { SecureMessageResult } from './SecureMessageResult';

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
  const nextStep = useCallback(() => {
    if (step === 'editor') {
      setStep('encrypt');
    }
  }, [step]);

  const STEPS = {
    encrypt: () => (
      <>
        <ChunkConfigurationEditor message={value} />
      </>
    ),
    editor: () => (
      <>
        <Editor value={value} handleChange={handleChange} nextStep={nextStep} />
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

const OfflineWarning = () => {
  const isOnline = useIsOnline();
  if (isOnline) {
    return (
      <Alert intent="warning" title="Watch out! You seem to be connected to the internet." marginBottom={majorScale(3)}>
        <Text>
          We recommend to stay off-line during message preparation.{' '}
          <Link href="/safety">Learn more about the recommended setup.</Link>
        </Text>
      </Alert>
    );
  }

  return (
    <Alert intent="success" title="Your browser is off-line." marginBottom={majorScale(3)}>
      <Text>
        Make sure to read more about the <Link href="/safety">recommended setup.</Link>
      </Text>
    </Alert>
  );
};

type EditorProps = {
  value: string;
  handleChange: (a0: string, a1?: boolean) => void;
  nextStep: () => void;
};

const Editor = ({ value, handleChange, nextStep }: EditorProps) => {
  return (
    <>
      <Heading marginTop={majorScale(3)}>What message would you like to encrypt?</Heading>
      <Heading size={300} marginTop={majorScale(1)} marginBottom={majorScale(2)}>
        Fell free to start with something basic for now, you will have a chance to edit it any time.
      </Heading>
      <Pane display="flex" padding={0}>
        <Pane padding={0} margin={0} flex="6">
          <MessageEditor value={value} onChange={handleChange} />
        </Pane>
        <Pane margin="0" paddingTop="0" flex="2">
          <Text>If you need help writing the message you may try some of the templates below.</Text>
          <UnorderedList>
            <ListItem>
              <Link
                href="#"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  handleChange(Examples.funny, true);
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

const ChunkConfigurationEditor = ({ message }: { message: string }) => {
  const [requiredChunks, setRequiredChunks] = useState(2);
  const [spareChunks, setSpareChunks] = useState(1);
  const chunksConfiguration = useMemo(
    () => ({
      required: requiredChunks,
      spare: spareChunks,
    }),
    [requiredChunks, spareChunks],
  );

  return (
    <>
      <Pane margin="0" padding="0" display="flex" alignItems="flex-start">
        <RequiredChunks requiredChunks={requiredChunks} setRequiredChunks={setRequiredChunks} />
        <SpareChunks spareChunks={spareChunks} setSpareChunks={setSpareChunks} />
      </Pane>
      <SecureMessageResult chunkConfiguration={chunksConfiguration} message={message} />
    </>
  );
};

const SpareChunks = ({
  spareChunks,
  setSpareChunks,
}: {
  spareChunks: number;
  setSpareChunks: (a0: number) => void;
}) => {
  const spareChunksDescription = (
    <>
      I also need
      <DraggableNumberInput
        value={spareChunks}
        onChange={setSpareChunks}
        min={MIN_NO_OF_ADDITIONAL_PIECES}
        max={MAX_NO_OF_ADDITIONAL_PIECES}
      />
      additional backup pieces.
    </>
  );
  return (
    <Pane flex="1" padding="0" display="flex" flexDirection="row" alignItems="flex-start">
      <KeyIcon size={32} marginRight={majorScale(2)} />
      <TextInputField
        label="Number of backup pieces"
        hint={spareChunksDescription}
        type="number"
        min={MIN_NO_OF_ADDITIONAL_PIECES}
        max={MAX_NO_OF_ADDITIONAL_PIECES}
        value={spareChunks}
        onChange={(ev: ChangeEvent<HTMLInputElement>) => {
          const val = parseInt(ev.target.value);
          // TODO [ToDr] Clamp and validate
          setSpareChunks(val);
        }}
      ></TextInputField>
    </Pane>
  );
};

const RequiredChunks = ({
  requiredChunks,
  setRequiredChunks,
}: {
  requiredChunks: number;
  setRequiredChunks: (a0: number) => void;
}) => {
  const requiredChunksDescription = (
    <>
      I want any
      <DraggableNumberInput
        value={requiredChunks}
        onChange={setRequiredChunks}
        min={MIN_NO_OF_RECIPIENTS}
        max={MAX_NO_OF_RECIPIENTS}
      />
      {requiredChunks > 1 ? 'recipients to come together ' : 'recipient to be able '}
      to read the message.
    </>
  );
  return (
    <Pane flex="1" padding="0" marginRight={majorScale(2)} display="flex" flexDirection="row" alignItems="flex-start">
      <NewPersonIcon size={32} marginRight={majorScale(2)} />
      <TextInputField
        label="Number of pieces required for restoration."
        hint={requiredChunksDescription}
        type="number"
        min={MIN_NO_OF_RECIPIENTS}
        max={MAX_NO_OF_RECIPIENTS}
        value={requiredChunks}
        onChange={(ev: any) => setRequiredChunks(ev.target.value)}
      ></TextInputField>
    </Pane>
  );
};

const Examples = {
  funny: FUNNY,
};
