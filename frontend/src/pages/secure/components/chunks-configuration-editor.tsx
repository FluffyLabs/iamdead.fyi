import { Text, Heading, KeyIcon, Link, NewPersonIcon, Pane, majorScale } from 'evergreen-ui';
import { useState, useEffect } from 'react';
import { DraggableNumber } from '../../../components/draggable-number';
import {
  MAX_NO_OF_ADDITIONAL_PIECES,
  MAX_NO_OF_RECIPIENTS,
  MIN_NO_OF_ADDITIONAL_PIECES,
  MIN_NO_OF_RECIPIENTS,
} from '../../oldwizard/security/consts';
import { ChunksConfiguration } from '../../../services/crypto';

type ChunksConfigurationEditorProps = {
  configuration: ChunksConfiguration;
  onChange: (a0: ChunksConfiguration) => void;
};
export const ChunksConfigurationEditor = ({ configuration, onChange }: ChunksConfigurationEditorProps) => {
  const [requiredChunks, setRequiredChunks] = useState(configuration.required);
  const [spareChunks, setSpareChunks] = useState(configuration.spare);

  // sync internal changes
  useEffect(() => {
    onChange({
      required: requiredChunks,
      spare: spareChunks,
    });
  }, [onChange, requiredChunks, spareChunks]);

  // sync incoming changes
  useEffect(() => {
    setRequiredChunks(configuration.required);
    setSpareChunks(configuration.spare);
  }, [configuration]);

  return (
    <>
      <Pane margin="0" padding="0">
        <Heading marginTop={majorScale(3)}>How would you like us to split the encryption key?</Heading>
        <Heading size={300} marginTop={majorScale(1)} marginBottom={majorScale(2)}>
          Your message is going to be encrypted with a one-time, random key. The key will be then split using{' '}
          <Link href="https://en.wikipedia.org/wiki/Shamir's_secret_sharing">Shamir's Secret Sharing</Link>.
        </Heading>
        <Pane background="tint2">
          <RequiredChunks requiredChunks={requiredChunks} setRequiredChunks={setRequiredChunks} />
          <SpareChunks spareChunks={spareChunks} requiredChunks={requiredChunks} setSpareChunks={setSpareChunks} />
        </Pane>
      </Pane>
    </>
  );
};

const SpareChunks = ({
  spareChunks,
  requiredChunks,
  setSpareChunks,
}: {
  spareChunks: number;
  requiredChunks: number;
  setSpareChunks: (a0: number) => void;
}) => {
  const number = (
    <DraggableNumber
      value={spareChunks}
      onChange={setSpareChunks}
      min={MIN_NO_OF_ADDITIONAL_PIECES}
      max={MAX_NO_OF_ADDITIONAL_PIECES}
    />
  );
  return (
    <Pane flex="1" padding="0" display="flex" flexDirection="row" alignItems="flex-start">
      <NewPersonIcon size={32} marginRight={majorScale(2)} />
      <Heading size={800}>{number}</Heading>
      <Pane padding="0" margin="0" display="flex" flexDirection="column">
        <Heading size={400}>Number of backup pieces.</Heading>
        <Text>
          I also need {number}
          additional backup pieces, so {spareChunks + requiredChunks} pieces in total.
        </Text>
      </Pane>
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
  const number = (
    <DraggableNumber
      value={requiredChunks}
      onChange={setRequiredChunks}
      min={MIN_NO_OF_RECIPIENTS}
      max={MAX_NO_OF_RECIPIENTS}
    />
  );
  return (
    <Pane flex="1" padding="0" marginRight={majorScale(2)} display="flex" flexDirection="row" alignItems="flex-start">
      <KeyIcon size={32} marginRight={majorScale(2)} />
      <Heading size={800}>{number}</Heading>
      <Pane padding="0" margin="0" display="flex" flexDirection="column">
        <Heading size={400}>Minimal number of pieces to read the message.</Heading>
        <Text>
          I want to read the message when any
          {number} pieces are collected together.
        </Text>
      </Pane>
    </Pane>
  );
};
