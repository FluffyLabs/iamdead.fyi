import React, { useCallback } from 'react';

import { useWizardContext } from '../../wizard-context';
import { Units } from '../../wizard-context/proof-of-life';
import { NewAdapterPopover } from '../new-adapter-popover';
import { PlusButton } from '../plus-button';
import { GroupSublist } from '../group-sublist';
import { Adapter } from '../../../../services/adapters';

import styles from './styles.module.scss';

export const GroupList = () => {
  const { proofOfLife } = useWizardContext();

  const addNewAdapterGroup = useCallback(
    ({ adapter, adapterId }: { adapter: Adapter; adapterId: string }) => {
      proofOfLife.addNewGroup({ ...adapter, adapterId, time: 5, unit: Units.Months });
    },
    [proofOfLife],
  );

  return (
    <ul className={styles.mainList}>
      {proofOfLife.listOfAdapters.map((group, i) => (
        <React.Fragment key={i}>
          <GroupSublist items={group} groupIndex={i} />
          {i < proofOfLife.listOfAdapters.length - 1 && <li>and</li>}
        </React.Fragment>
      ))}
      <li>
        <NewAdapterPopover onNewAdapter={addNewAdapterGroup}>
          <PlusButton label="and" />
        </NewAdapterPopover>
      </li>
    </ul>
  );
};
