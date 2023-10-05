import { KeyIcon, NewPersonIcon, Pane, TextInputField, majorScale } from 'evergreen-ui';
import { useState, ChangeEvent, useEffect } from 'react';
import { DraggableNumberInput } from '../../../components/draggable-number-input';
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
      <Pane margin="0" padding="0" display="flex" alignItems="flex-start">
        <RequiredChunks requiredChunks={requiredChunks} setRequiredChunks={setRequiredChunks} />
        <SpareChunks spareChunks={spareChunks} setSpareChunks={setSpareChunks} />
      </Pane>
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
