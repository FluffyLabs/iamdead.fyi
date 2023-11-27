import { useCallback, useEffect, useRef, useState } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { OfflineWarning } from './components/offline-warning';
import { ChunksConfigurationEditor } from './components/chunks-configuration-editor';
import { SecureMessageResult } from './components/secure-message-result';
import { Editor } from './components/editor';
import { useNavigate } from 'react-router-dom';
import { useIsOnline } from '../../hooks/use-is-online';
import { NextStepButton } from '../../components/next-step-button';
import { Progress } from './components/progress';
import { useCryptoPreload } from '../../hooks/use-crypto-preload';
import { ChunksMeta, useChunks } from '../../hooks/use-chunks';
import { RichSecureMessageResult, useSecureMessage } from '../../hooks/use-secure-message';
import { encryptedMessageBytes } from '../../components/encrypted-message-view';

export type EncryptionResult = {
  encryptedMessageRaw: string[];
  encryptedMessageBytes: number;
  chunks: ChunksMeta[];
};

export type Steps = 'editor' | 'encrypt' | 'chunks';

type UserDefined = {
  name: string;
  description: string;
};

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

function exportEncryptionResult(
  chunks: ChunksMeta[],
  secureMessageResult: RichSecureMessageResult | null,
): EncryptionResult | null {
  if (!secureMessageResult) {
    return null;
  }

  return {
    chunks,
    encryptedMessageRaw: secureMessageResult.encryptedMessage,
    encryptedMessageBytes: encryptedMessageBytes(secureMessageResult.encryptedMessage),
  } as EncryptionResult;
}

export const Secure = () => {
  const isCryptoLoaded = useCryptoPreload();
  const { value, handleChange } = useEditorState();
  const [step, setStep] = useState('editor' as Steps);
  const [chunksConfiguration, setChunksConfiguration] = useState({
    required: 2,
    spare: 1,
  });
  const secureMessageApi = useSecureMessage();
  const { result: secureMessageResult, secureMessage } = secureMessageApi;
  const chunksApi = useChunks([] as ChunksMeta[]);
  const [userDefined, setUserDefined] = useState([] as UserDefined[]);
  const { chunks, setChunks } = chunksApi;

  const userDefinedRef = useRef(userDefined);
  // update user defined every time the chunks change
  useEffect(() => {
    const newUserDefined = chunks.map((x) => ({
      name: x.chunk.name,
      description: x.description,
    }));
    let shouldUpdate = false;
    const oldUserDefined = userDefinedRef.current;
    newUserDefined.forEach((val, idx) => {
      const oldVal = oldUserDefined[idx];
      if (!oldVal) {
        return;
      }

      if (oldVal.name !== val.name || oldVal.description !== val.description) {
        oldUserDefined[idx] = val;
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      setUserDefined([...oldUserDefined]);
    }
  }, [chunks, userDefinedRef, setUserDefined]);

  // call secure message every time message or configuration changes
  useEffect(() => {
    // Note, we don't want to re-call secureMessage on name change,
    // hence using ref here.
    const names = userDefinedRef.current.map((x) => x.name);
    secureMessage(value, chunksConfiguration, names).then((result) => {
      if (!result) {
        return;
      }

      const userDefined = userDefinedRef.current;
      // every time the result changes, update the chunks
      const newChunks = result.chunks.map((chunk, idx) => {
        return {
          chunk,
          description: userDefined[idx]?.description || '',
        };
      });
      setChunks(newChunks);
    });
  }, [value, chunksConfiguration, setChunks, secureMessage, userDefinedRef]);

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
            encryptionResult: exportEncryptionResult(chunks, secureMessageResult),
          },
        });
      }
    }
  }, [step, navigate, chunks, chunksConfiguration, secureMessageResult]);

  const STEPS = {
    encrypt: () => (
      <>
        <SecureMessageResult
          chunksConfiguration={chunksConfiguration}
          message={value}
          encryptedMessage={secureMessageResult?.encryptedMessage}
          chunksApi={chunksApi}
          secureMessageApi={secureMessageApi}
          goToStep={setStep}
          nextStep={
            <NextStepButton
              nextStep={nextStep}
              disabled={!secureMessageResult || !isOnline}
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
