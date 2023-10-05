import { DraggableNumber } from '../../../../components/draggable-number';
import { useWizardContext } from '../../wizard-context';
import { MAX_NO_OF_ADDITIONAL_PIECES, MIN_NO_OF_ADDITIONAL_PIECES } from '../consts';

export const OneRecipient = () => {
  const { security } = useWizardContext();

  return (
    <>
      <DraggableNumber
        value={security.noOfAdditionalPieces.value}
        onChange={security.noOfAdditionalPieces.setValue}
        max={MAX_NO_OF_ADDITIONAL_PIECES}
        min={MIN_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      extra keys
    </>
  );
};
