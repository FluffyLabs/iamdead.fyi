import { useCallback } from 'react';

import { useWizardContext } from '../../wizard-context';
import { DraggableNumberInput } from '../../../../components/draggable-number-input';
import { MAX_NO_OF_ADDITIONAL_PIECES } from '../consts';

export const ManyRecipients = () => {
  const { security } = useWizardContext();

  const handleNoOfPiecesChange = useCallback(
    (val: number) => {
      security.noOfAdditionalPieces.setValue(val - security.noOfRecipients.value);
    },
    [security.noOfAdditionalPieces, security.noOfRecipients],
  );
  return (
    <>
      <DraggableNumberInput
        value={security.noOfAdditionalPieces.value + security.noOfRecipients.value}
        onChange={handleNoOfPiecesChange}
        min={security.noOfRecipients.value}
        max={security.noOfRecipients.value + MAX_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      pieces to be distributed
    </>
  );
};
