import { Text, Heading, KeyIcon, Link, NewPersonIcon, Pane, majorScale } from 'evergreen-ui';
import { useState, useEffect, useCallback } from 'react';
import { DraggableNumber } from '../../../components/draggable-number';
import {
  MAX_NO_OF_ADDITIONAL_PIECES,
  MAX_NO_OF_RECIPIENTS,
  MIN_NO_OF_ADDITIONAL_PIECES,
  MIN_NO_OF_RECIPIENTS,
} from '../consts';
import { ChunksConfiguration } from '../../../services/crypto';
import { Slab } from '../../../components/slab';

type ChunksConfigurationEditorProps = {
  configuration: ChunksConfiguration;
  onChange: (a0: ChunksConfiguration) => void;
};
export const ChunksConfigurationEditor = ({ configuration, onChange }: ChunksConfigurationEditorProps) => {
  const [totalChunks, setTotalChunks] = useState(configuration.required + configuration.spare);
  const [spareChunks, setSpareChunks] = useState(configuration.spare);

  const requiredChunks = totalChunks - spareChunks;
  const setRequiredChunks = useCallback(
    (v: number) => {
      setSpareChunks(Math.max(0, totalChunks - v));
    },
    [totalChunks],
  );

  // Instead of increasing the required chunks when
  // some one is dragging the button, we rather want to increase
  // the spare chunks.
  const alterTotalChunks = useCallback(
    (v: number) => {
      setTotalChunks(v);
      setSpareChunks(v - requiredChunks);
    },
    [requiredChunks],
  );

  // sync internal changes
  useEffect(() => {
    const newVal = {
      required: totalChunks - spareChunks,
      spare: spareChunks,
    };
    // avoid refreshing if the component is created
    // but there is just no change.
    if (configuration.required !== newVal.required || configuration.spare !== newVal.spare) {
      onChange(newVal);
    }
  }, [onChange, configuration, totalChunks, spareChunks]);

  // sync incoming changes
  useEffect(() => {
    setTotalChunks(configuration.required + configuration.spare);
    setSpareChunks(configuration.spare);
  }, [configuration]);

  return (
    <>
      <Pane>
        <Heading marginTop={majorScale(3)}>How would you like us to split the encryption key?</Heading>
        <Heading
          size={300}
          marginTop={majorScale(1)}
          marginBottom={majorScale(2)}
        >
          Your message is going to be encrypted with a one-time, random key. The key will be then split using{' '}
          <Link href="https://en.wikipedia.org/wiki/Shamir's_secret_sharing">Shamir's Secret Sharing</Link>.
        </Heading>
        <Slab background="tint2">
          <TotalChunks
            totalChunks={totalChunks}
            requiredChunks={requiredChunks}
            setTotalChunks={alterTotalChunks}
          />
          <RequiredChunks
            totalChunks={totalChunks}
            requiredChunks={requiredChunks}
            setRequiredChunks={setRequiredChunks}
          />
        </Slab>
      </Pane>
    </>
  );
};

const TotalChunks = ({
  totalChunks,
  requiredChunks,
  setTotalChunks,
}: {
  totalChunks: number;
  requiredChunks: number;
  setTotalChunks: (a0: number) => void;
}) => {
  const number = (buttons: boolean = true) => (
    <DraggableNumber
      value={totalChunks}
      onChange={setTotalChunks}
      min={Math.max(MIN_NO_OF_ADDITIONAL_PIECES, requiredChunks)}
      max={MAX_NO_OF_ADDITIONAL_PIECES}
      buttons={buttons}
    />
  );
  return (
    <Slab
      flex="1"
      padding="0"
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      <NewPersonIcon
        size={32}
        flexShrink="0"
        marginRight={majorScale(2)}
      />
      <Heading size={800}>{number()}</Heading>
      <Pane
        display="flex"
        flexDirection="column"
      >
        <Heading size={400}>Number of pieces.</Heading>
        <Text>I need {number(false)} unique restoration pieces.</Text>
      </Pane>
    </Slab>
  );
};

const RequiredChunks = ({
  totalChunks,
  requiredChunks,
  setRequiredChunks,
}: {
  totalChunks: number;
  requiredChunks: number;
  setRequiredChunks: (a0: number) => void;
}) => {
  const number = (buttons: boolean = true) => (
    <DraggableNumber
      value={requiredChunks}
      onChange={setRequiredChunks}
      min={MIN_NO_OF_RECIPIENTS}
      max={Math.min(MAX_NO_OF_RECIPIENTS, totalChunks)}
      buttons={buttons}
    />
  );
  return (
    <Slab
      flex="1"
      padding="0"
      marginRight={majorScale(2)}
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      <KeyIcon
        size={32}
        marginRight={majorScale(2)}
        flexShrink="0"
      />
      <Heading size={800}>{number()}</Heading>
      <Pane
        display="flex"
        flexDirection="column"
      >
        <Heading size={400}>Minimal number of pieces to read the message.</Heading>
        <Text>I want to be able to restore the message when any {number(false)} pieces are collected together.</Text>
      </Pane>
    </Slab>
  );
};
