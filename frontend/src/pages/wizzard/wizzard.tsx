import { Outlet } from 'react-router-dom';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { DEFAULT_WIZZARD_ROUTE, Steps } from './consts';
import { useStepName, useStepsNavigation } from './hooks';

const createStepConfig = (title: string, previousStep: Steps | null, nextStep: Steps | null) => ({
  title,
  nextStep,
  previousStep,
});

const STEPS_CONFIG = {
  [Steps.Security]: createStepConfig('STEP 1: Configure Security', null, Steps.Recipients),
  [Steps.Recipients]: createStepConfig('STEP 2: Configure Recipients', Steps.Security, Steps.ProofOfLife),
  [Steps.ProofOfLife]: createStepConfig('STEP 3: Configure Proof of Life', Steps.Recipients, Steps.Message),
  [Steps.Message]: createStepConfig('STEP 4: Create Message', Steps.ProofOfLife, null),
};
export const Wizzard = () => {
  useDefaultSubpath(DEFAULT_WIZZARD_ROUTE);
  const stepName = useStepName();
  const stepConfig = STEPS_CONFIG[stepName];
  const { handleNext, handlePrevious } = useStepsNavigation(stepConfig);
  return (
    <div className="md:container md:mx-auto px-4">
      <h1 className="text-xl">{stepConfig.title}</h1>
      <Outlet />

      <div className="flex flex-row justify-between">
        <button
          disabled={!stepConfig.previousStep}
          type="button"
          onClick={handlePrevious}
          className="bg-secondary text-white text-xs px-2 py-3 rounded-md w-24"
        >
          Previous
        </button>
        <button
          disabled={!stepConfig.nextStep}
          type="button"
          onClick={handleNext}
          className="bg-primary text-white text-xs px-2 py-3 rounded-md w-24"
        >
          Next
        </button>
      </div>
    </div>
  );
};
