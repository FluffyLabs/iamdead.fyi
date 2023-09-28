import { useCallback } from 'react';

import { Units } from '../wizard-context/proof-of-life';
import { useWizardContext } from '../wizard-context';
import { AdapterSelector } from './adapter-selector';
import { GroupList } from './group-list';
import { Adapter } from '../../../services/adapters';

import styles from './styles.module.scss';

export const ProofOfLife = () => {
  const { proofOfLife } = useWizardContext();
  const addNewAdapterGroup = useCallback(
    ({ adapter, adapterId }: { adapter: Adapter; adapterId: string }) => {
      proofOfLife.addNewGroup({ ...adapter, adapterId, time: 5, unit: Units.Months });
    },
    [proofOfLife],
  );

  return (
    <div>
      {proofOfLife.listOfAdapters.length > 0 && (
        <>
          <h2 className={styles.header}>I want the pieces to be sent when:</h2>
          <GroupList />
        </>
      )}
      {proofOfLife.listOfAdapters.length === 0 && <AdapterSelector onChange={addNewAdapterGroup} />}
    </div>
  );
};
