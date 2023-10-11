import { Card, Checkbox, Heading, KeyIcon, LockIcon, Paragraph, Position, Tooltip, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { useLocation } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Progress } from './components/progress';
import { Intro } from './components/intro';
// TODO [ToDr] Move the type to some other place?
import { ChunksMeta } from '../secure/components/secure-message-result/secure-message-result';
import { Slab } from '../../components/slab';

export type Steps = 'recipients' | 'proof-of-life';

export const Store = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading size={700} marginBottom={majorScale(5)}>
          Configure on-line account & proof of life.
        </Heading>
        <Storage />
      </Container>
    </>
  );
};

const Storage = () => {
  const { state } = useLocation();

  const [step, setStep] = useState('recipients' as Steps);
  const [chunks] = useState(state.encryptionResult?.chunks);

  if (!state) {
    return <Intro />;
  }

  const STEPS = {
    recipients: () => (
      <>
        <Recipients chunks={chunks} messageBytes={state.encryptionResult?.encryptedMessageBytes} />
      </>
    ),
    'proof-of-life': () => <></>,
  };

  return (
    <>
      <Progress step={step} setStep={setStep} />
      {STEPS[step]()}
    </>
  );
};

const Recipients = ({ chunks, messageBytes }: { chunks: ChunksMeta[]; messageBytes: number }) => {
  const total = chunks.length;
  return (
    <Slab>
      <Paragraph>
        Select only pieces that you wish to store to your on-line account. The remaining pieces will be available to
        download as a <strong>recovery key</strong>.
      </Paragraph>
      <EncryptedMessageRow messageBytes={messageBytes} />
      {chunks.map((chunk, idx) => (
        <RecipientRow chunk={chunk} idx={idx} total={total} />
      ))}
    </Slab>
  );
};

const EncryptedMessageRow = ({ messageBytes }: { messageBytes: number }) => {
  // TODO [ToDr] Make storing encrypted message optional. in such case
  // it has to be provided separately for recovery.
  return (
    <Row>
      <LockIcon size={majorScale(5)} />
      <Heading size={400} marginLeft={majorScale(2)}>
        Encrypted message ({messageBytes} bytes)
      </Heading>
      <Tooltip content={'Storing the encrypted message is currently mandatory.'} position={Position.TOP}>
        <Checkbox marginLeft={majorScale(2)} disabled checked />
      </Tooltip>
    </Row>
  );
};

const RecipientRow = ({ chunk, idx, total }: { chunk: ChunksMeta; idx: number; total: number }) => {
  return (
    <Row>
      <KeyIcon size={majorScale(5)} />
      <Heading size={400} marginLeft={majorScale(2)}>
        {idx}/{total}
      </Heading>
      <Heading size={400} marginLeft={majorScale(2)}>
        {chunk.name}
      </Heading>
      <Checkbox marginLeft={majorScale(2)} />
    </Row>
  );
};

const Row = ({ children }: { children: ReactNode }) => {
  return (
    <Card elevation={1} display="flex" padding={majorScale(2)} marginY={majorScale(3)} alignItems="center">
      {children}
    </Card>
  );
};
