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
import { SecureMessageApi } from '../../../../hooks/use-secure-message';
import { ChunksConfiguration } from '../../../../services/crypto';
import { Summary } from './summary';
import { Slab } from '../../../../components/slab';
import { Steps } from '../../secure';
import { EncryptedMessage } from './encrypted-message';
import { Chunks } from './chunks';
import { QRCodeSVG } from 'qrcode.react';
import { ChunksApi, ChunksMeta } from '../../../../hooks/use-chunks';

export type Props = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
  encryptedMessage: string[] | undefined;
  chunksApi: ChunksApi<ChunksMeta>;
  secureMessageApi: SecureMessageApi;
  goToStep: (a0: Steps) => void;
  nextStep: ReactNode;
};

export const SecureMessageResult = ({
  message,
  encryptedMessage,
  chunksConfiguration,
  chunksApi,
  secureMessageApi,
  goToStep,
  nextStep,
}: Props) => {
  const { isLoading, error } = secureMessageApi;

  return (
    <>
      <Summary
        message={message}
        chunksConfiguration={chunksConfiguration}
        goToStep={goToStep}
      />
      <IsLoading isLoading={isLoading} />
      <DisplayResult
        encryptedMessage={encryptedMessage}
        chunksApi={chunksApi}
        error={error}
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
  encryptedMessage,
  error,
  chunksApi,
  nextStep,
}: {
  encryptedMessage: string[] | undefined;
  error: string | null;
  chunksApi: ChunksApi<ChunksMeta>;
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

  if (!encryptedMessage) {
    return (
      <EmptyState
        title="Encryption results are not available yet."
        icon={<SmallCrossIcon />}
        iconBgColor="tint"
      />
    );
  }

  const requiredChunks = chunksApi.chunks[0]?.chunk?.requiredChunks;

  return (
    <Slab
      background="tint2"
      display="flex"
      flexWrap="wrap-reverse"
    >
      <Pane flex="1">
        <EncryptedMessage encryptedMessage={encryptedMessage} />
        <Chunks
          chunks={chunksApi.chunks}
          onNameChange={chunksApi.changeName}
          onDescriptionChange={chunksApi.changeDescription}
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
