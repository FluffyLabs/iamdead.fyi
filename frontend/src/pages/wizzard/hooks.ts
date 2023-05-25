import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_STEP, Steps } from './consts';

export function useStepName(): Steps {
  const { pathname } = useLocation();
  const lastFragment = pathname
    .split('/')
    .filter((pathFragment) => !!pathFragment)
    .pop() as Steps;
  const isStepName = Object.values(Steps).includes(lastFragment);
  if (!isStepName) {
    return DEFAULT_STEP;
  }

  return lastFragment;
}

export function useStepsNavigation({ nextStep, previousStep }: { nextStep: Steps | null; previousStep: Steps | null }) {
  const navigate = useNavigate();

  const navigateToStep = useCallback(
    (stepName: Steps | null) => {
      if (!stepName) {
        return;
      }

      navigate(`/wizzard/${stepName}`);
    },
    [navigate],
  );

  const handleNext = useCallback(() => navigateToStep(nextStep), [navigateToStep, nextStep]);
  const handlePrevious = useCallback(() => navigateToStep(previousStep), [navigateToStep, previousStep]);

  return { handleNext, handlePrevious };
}
