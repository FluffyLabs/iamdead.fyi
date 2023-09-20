import { Outlet } from 'react-router-dom';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { DEFAULT_WIZARD_ROUTE, Steps } from './consts';
import { useStepName, useStepsNavigation } from './hooks';
import { WizardContextProvider, useWizard } from './wizard-context';
import { Button } from 'evergreen-ui';
import { ProgressBar } from '../../components/progress-bar';
import { Divider } from '../../components/divider';
import { Container } from '../../components/container';

import styles from './styles.module.scss';

const createStepConfig = (title: string, previousStep: Steps | null, nextStep: Steps | null, progress: string) => ({
  title,
  nextStep,
  previousStep,
  progress,
});

const STEPS_CONFIG = {
  [Steps.Security]: createStepConfig('STEP 1: Configure Security', null, Steps.ProofOfLife, '25%'),
  [Steps.ProofOfLife]: createStepConfig('STEP 2: Configure Proof of Life', Steps.Security, Steps.Message, '50%'),
  [Steps.Message]: createStepConfig('STEP 3: Create Message', Steps.ProofOfLife, null, '75%'),
};
export const Wizard = () => {
  const wizard = useWizard();
  useDefaultSubpath(DEFAULT_WIZARD_ROUTE);
  const stepName = useStepName();
  const stepConfig = STEPS_CONFIG[stepName];
  const { handleNext, handlePrevious } = useStepsNavigation(stepConfig);
  return (
    <Container>
      <div className="md:container md:mx-auto px-4">
        <h1 className={styles.header}>{stepConfig.title}</h1>

        <ProgressBar progress={stepConfig.progress} />

        <WizardContextProvider value={wizard}>
          <Outlet />
        </WizardContextProvider>

        <Divider />

        <div className={styles.buttons}>
          <Button appearance="primary" onClick={handlePrevious}>
            Previous
          </Button>
          <Button appearance="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </Container>
  );
};
