import { ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  Pane,
  Spinner,
  majorScale,
  Alert,
  EmptyState,
  SmallCrossIcon,
  Card,
  Paragraph,
  Heading,
  Button,
  Popover,
  ChevronRightIcon,
} from 'evergreen-ui';
import { useSecureMessage } from '../../../../hooks/use-secure-message';
import { ChunksConfiguration } from '../../../../services/crypto';
import { Summary } from './summary';
import { Slab } from '../../../../components/slab';
import { encryptedMessageBytes } from '../../../../components/encrypted-message-view';
import { Steps, UserDefined } from '../../secure';
import { EncryptedMessage } from './encrypted-message';
import { Chunks } from './chunks';
import { QRCodeSVG } from 'qrcode.react';
import { ChunksMeta } from '../../../../hooks/use-chunks';

export type Result = {
  encryptedMessageRaw: string[];
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
  nextStep: ReactNode;
};

export const SecureMessageResult = ({
  message,
  chunksConfiguration,
  result,
  setResult,
  userDefined,
  setUserDefined,
  goToStep,
  nextStep,
}: Props) => {
  const { secureMessage, result: localResult, error, isLoading, alterChunkName } = useSecureMessage();
  // TODO [ToDr] This stuff probably needs a re-design with use-chunks.
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
        return Promise.resolve(null);
      }

      return alterChunkName(chunkIndex, newName).then(
        ({ isNameOk, error }: { isNameOk: boolean; error: string | null }) => {
          if (isNameOk) {
            userDefined[chunkIndex] = {
              name: newName,
              description: userDefined[chunkIndex]?.description || '',
            };
            const newUserDefined = [...userDefined];
            setUserDefined(newUserDefined);
            userDefinedRef.current = newUserDefined;
          }
          return error;
        },
      );
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
      encryptedMessageRaw: encryptedMessage,
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
        onChunkDescriptionChange={handleChunkDescritptionChange}
        nextStep={nextStep}
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
  onChunkDescriptionChange,
  nextStep,
}: {
  result: Result | null;
  error: string | null;
  onChunkNameChange: (chunkIndex: number, newName: string) => Promise<string | null>;
  onChunkDescriptionChange: (chunkIndex: number, newDescription: string) => void;
  nextStep: ReactNode;
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

  const requiredChunks = result?.chunks[0]?.chunk?.requiredChunks;

  return (
    <Slab
      background="tint2"
      display="flex"
      flexWrap="wrap-reverse"
    >
      <Pane flex="1">
        <EncryptedMessage encryptedMessage={result.encryptedMessageRaw} />
        <Chunks
          chunks={result.chunks}
          onNameChange={onChunkNameChange}
          onDescriptionChange={onChunkDescriptionChange}
        />
      </Pane>
      <Card
        flex="1"
        minWidth="200px"
        paddingX={majorScale(3)}
        marginBottom={majorScale(5)}
      >
        <Heading
          size={500}
          marginBottom={majorScale(2)}
        >
          What now?
        </Heading>
        <Paragraph>
          Download & store the encrypted message safely and distribute the restoration pieces according to your
          preference.
        </Paragraph>
        <br />
        <Paragraph>Remember that any {requiredChunks} restoration pieces can be used to decrypt the message.</Paragraph>
        <br />
        <Paragraph>
          Note that not only the pieces, but also the encrypted message IS MANDATORY for the restoration.
        </Paragraph>

        <Heading
          size={500}
          marginTop={majorScale(4)}
          marginBottom={majorScale(2)}
        >
          What next?
        </Heading>
        <Paragraph>
          You can choose to upload some of the restoration pieces to your on-line account and configure recipients and
          conditions under which they will be distributed.
        </Paragraph>

        {nextStep}

        <Slab
          padding="0"
          display="flex"
          justifyContent="center"
        >
          <Popover content={<GoToScanPageQr />}>
            <Button iconAfter={<ChevronRightIcon />}>Continue on a different device</Button>
          </Popover>
        </Slab>
      </Card>
    </Slab>
  );
};

const GoToScanPageQr = () => {
  const loc = window.location;
  const url = `${loc.protocol}//${loc.host}/scan`;
  return (
    <Slab
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxWidth="400px"
    >
      <Paragraph>
        This process can be also continued on a different device. <br />
        Scan the QR code below to open the page.
      </Paragraph>
      <Pane marginY={majorScale(2)}>
        <QRCodeSVG value={url} />
      </Pane>
      <Paragraph>{url}</Paragraph>
    </Slab>
  );
};
