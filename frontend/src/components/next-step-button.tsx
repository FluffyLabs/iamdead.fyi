import { Button, ChevronRightIcon } from 'evergreen-ui';
import { ReactNode } from 'react';
import { Slab } from './slab';

export const NextStepButton = ({
  nextStep,
  children,
  disabled,
}: {
  nextStep: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => {
  return (
    <Slab display="flex" padding="0" justifyContent="center">
      <Button iconAfter={<ChevronRightIcon />} appearance="primary" size="large" onClick={nextStep} disabled={disabled}>
        {children}
      </Button>
    </Slab>
  );
};
