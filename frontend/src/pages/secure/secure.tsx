import { useCallback, useState } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { OfflineWarning } from './components/offline-warning';
import { ChunksConfigurationEditor } from './components/chunks-configuration-editor';
import { SecureMessageResult, Result as CryptoResult } from './components/secure-message-result';
import { Editor } from './components/editor';
import { useNavigate } from 'react-router-dom';
import { useIsOnline } from '../../hooks/use-is-online';
import { NextStepButton } from '../../components/next-step-button';
import { Progress } from './components/progress';
import { useCryptoPreload } from '../../hooks/use-crypto-preload';

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

export type UserDefined = {
  name: string;
  description: string;
};

export type Steps = 'editor' | 'encrypt' | 'chunks';

export const Secure = () => {
  const isCryptoLoaded = useCryptoPreload();
  const { value, handleChange } = useEditorState();
  const [encryptionResult, setEncryptionResult] = useState(null as CryptoResult | null);
  const [step, setStep] = useState('editor' as Steps);
  const [chunksConfiguration, setChunksConfiguration] = useState({
    required: 2,
    spare: 1,
  });
  const [userDefined, setUserDefined] = useState([] as UserDefined[]);

  const isOnline = useIsOnline();

  const navigate = useNavigate();
  const nextStep = useCallback(() => {
    if (step === 'editor') {
      setStep('chunks');
    }

    if (step === 'chunks') {
      setStep('encrypt');
    }

    if (step === 'encrypt') {
      const isConfirmed = window.confirm(
        'After leaving this page your original message is removed and we are only going to work with the encrypted message and restoration pieces.',
      );
      if (isConfirmed) {
        navigate('/store', {
          state: {
            chunksConfiguration,
            encryptionResult,
          },
        });
      }
    }
  }, [step, navigate, chunksConfiguration, encryptionResult]);

  const STEPS = {
    encrypt: () => (
      <>
        <SecureMessageResult
          chunksConfiguration={chunksConfiguration}
          message={value}
          result={encryptionResult}
          setResult={setEncryptionResult}
          userDefined={userDefined}
          setUserDefined={setUserDefined}
          goToStep={setStep}
          nextStep={
            <NextStepButton
              nextStep={nextStep}
              disabled={!encryptionResult || !isOnline}
            >
              Store pieces on-line
            </NextStepButton>
          }
        />
      </>
    ),
    chunks: () => (
      <>
        <ChunksConfigurationEditor
          configuration={chunksConfiguration}
          onChange={setChunksConfiguration}
        />
        <NextStepButton nextStep={nextStep}>Encrypt the message</NextStepButton>
      </>
    ),
    editor: () => (
      <>
        <Editor
          value={value}
          onChange={handleChange}
        />
        <NextStepButton nextStep={nextStep}>Configure the encryption</NextStepButton>
      </>
    ),
  };

  return (
    <>
      <Navigation />
      <Container>
        <OfflineWarning isLoading={isCryptoLoaded} />
        <Progress
          step={step}
          setStep={setStep}
        />
        {STEPS[step]()}
      </Container>
    </>
  );
};
