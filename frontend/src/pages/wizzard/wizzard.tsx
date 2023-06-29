import { Outlet } from 'react-router-dom';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { DEFAULT_WIZZARD_ROUTE, Steps } from './consts';
import { useStepName, useStepsNavigation } from './hooks';
import { WizzardContextProvider, useWizzard } from './wizzard-context';

const createStepConfig = (
  title: string,
  previousStep: Steps | null,
  nextStep: Steps | null,
  progress: string,
) => ({ title, nextStep, previousStep, progress });

const STEPS_CONFIG = {
  [Steps.Security]: createStepConfig(
    'STEP 1: Configure Security',
    null,
    Steps.ProofOfLife,
    '25%',
  ),
  [Steps.ProofOfLife]: createStepConfig(
    'STEP 2: Configure Proof of Life',
    Steps.Security,
    Steps.Message,
    '50%',
  ),
  [Steps.Message]: createStepConfig(
    'STEP 3: Create Message',
    Steps.ProofOfLife,
    null,
    '75%',
  ),
};
export const Wizzard = () => {
  const wizzard = useWizzard();
  useDefaultSubpath(DEFAULT_WIZZARD_ROUTE);
  const stepName = useStepName();
  const stepConfig = STEPS_CONFIG[stepName];
  const { handleNext, handlePrevious } = useStepsNavigation(stepConfig);
  return (
    <div className="md:container md:mx-auto px-4">
      <h1 className="text-xl mt-5">{stepConfig.title}</h1>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
        <div
          className="my-5 h-1.5 rounded-full bg-primary transition-width transition-slowest ease"
          style={{ width: stepConfig.progress }}
        ></div>
      </div>

      <WizzardContextProvider value={wizzard}>
        <Outlet />
      </WizzardContextProvider>

      <hr className="h-px my-5 bg-gray-200 border-0 dark:bg-gray-700" />

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
