import { useCallback, useEffect, useRef } from 'react';
import { Pane, Spinner, majorScale, Alert, EmptyState, SmallCrossIcon, Card, Paragraph } from 'evergreen-ui';
import { useSecureMessage } from '../../../../hooks/use-secure-message';
import { ChunksConfiguration } from '../../../../services/crypto';
import { Summary } from './summary';
import { Slab } from '../../../../components/slab';
import { ChunksMeta } from '../../../../components/piece-view';
import { encryptedMessageBytes } from '../../../../components/encrypted-message-view';
import { Steps, UserDefined } from '../../secure';
import { EncryptedMessage } from './encrypted-message';
import { Chunks } from './chunks';

export type Result = {
  encryptedMessage: string[];
  encryptedMessageBytes: number;
  chunks: ChunksMeta[];
};

export type Props = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
  result: Result | null;
  setResult: (a0: Result | null) => void;
  userDefined: UserDefined[];
  setUserDefined: (a0: UserDefined[]) => void;
  goToStep: (a0: Steps) => void;
};

export const SecureMessageResult = ({
  message,
  chunksConfiguration,
  result,
  setResult,
  userDefined,
  setUserDefined,
  goToStep,
}: Props) => {
  const {
    secureMessage,
    result: localResult,
    error,
    isLoading,
    alterChunkName,
    alterChunkNameError,
  } = useSecureMessage();
  const userDefinedRef = useRef(userDefined);

  // call secure message every time message or configuration changes
  useEffect(() => {
    // Note, we don't want to re-call secureMessage on name change,
    // hence using ref here.
    const names = userDefinedRef.current.map((x) => x.name);
    secureMessage(message, chunksConfiguration, names);
  }, [message, chunksConfiguration, secureMessage, userDefinedRef]);

  const handleChunkNameChange = useCallback(
    (chunkIndex: number, newName: string) => {
      if (userDefined[chunkIndex]?.name === newName || localResult?.chunks[chunkIndex].name === newName) {
        return;
      }

      alterChunkName(chunkIndex, newName).then((isNameOk: boolean) => {
        if (isNameOk) {
          userDefined[chunkIndex] = {
            name: newName,
            description: userDefined[chunkIndex]?.description || '',
          };
          const newUserDefined = [...userDefined];
          setUserDefined(newUserDefined);
          userDefinedRef.current = newUserDefined;
        }
      });
    },
    [userDefined, setUserDefined, alterChunkName, userDefinedRef, localResult],
  );

  const handleChunkDescritptionChange = useCallback(
    (chunkIndex: number, newDescription: string) => {
      userDefined[chunkIndex] = {
        name: userDefined[chunkIndex]?.name,
        description: newDescription,
      };

      setUserDefined([...userDefined]);
    },
    [userDefined, setUserDefined],
  );

  // propagate updated results up
  useEffect(() => {
    if (!localResult) {
      setResult(localResult);
      return;
    }

    const { encryptedMessage } = localResult;
    const chunks = localResult.chunks.map((c, idx) => ({
      description: userDefined[idx]?.description || '',
      chunk: c,
    }));
    setResult({
      encryptedMessage,
      encryptedMessageBytes: encryptedMessageBytes(encryptedMessage),
      chunks,
    });
  }, [localResult, setResult, userDefined]);

  return (
    <>
      <Summary
        message={message}
        chunksConfiguration={chunksConfiguration}
        goToStep={goToStep}
      />
      <IsLoading isLoading={isLoading} />
      <DisplayResult
        result={result}
        error={error}
        onChunkNameChange={handleChunkNameChange}
        chunkNameChangeError={alterChunkNameError}
        onChunkDescriptionChange={handleChunkDescritptionChange}
      />
    </>
  );
};

const IsLoading = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) {
    return null;
  }
  // TODO [ToDr] Spinner should only be displayed after some timeout.
  return (
    <Spinner
      marginX="auto"
      marginY={majorScale(2)}
    />
  );
};

const DisplayResult = ({
  result,
  error,
  onChunkNameChange,
  chunkNameChangeError,
  onChunkDescriptionChange,
}: {
  result: Result | null;
  error: string | null;
  onChunkNameChange: (chunkIndex: number, newName: string) => void;
  chunkNameChangeError?: string;
  onChunkDescriptionChange: (chunkIndex: number, newDescription: string) => void;
}) => {
  if (error) {
    return (
      <Alert
        intent="danger"
        title={error}
      />
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="Encryption results are not available yet."
        icon={<SmallCrossIcon />}
        iconBgColor="tint"
      />
    );
  }

  return (
    <Slab
      background="tint2"
      display="flex"
      flexWrap="wrap-reverse"
    >
      <Pane flex="1">
        <EncryptedMessage encryptedMessage={result.encryptedMessage} />
        <Chunks
          chunks={result.chunks}
          onNameChange={onChunkNameChange}
          nameChangeError={chunkNameChangeError}
          onDescriptionChange={onChunkDescriptionChange}
        />
      </Pane>
      <Card
        flex="1"
        minWidth="200px"
        paddingX={majorScale(3)}
        marginBottom={majorScale(5)}
      >
        <Paragraph>
          Store the encrypted message safely and distributed the pieces according to your preference.
        </Paragraph>
        <br />
        <Paragraph>
          Note that encrypted message IS MANDATORY on top of the number of required pieces to restore the original
          message.
        </Paragraph>
      </Card>
    </Slab>
  );
};
