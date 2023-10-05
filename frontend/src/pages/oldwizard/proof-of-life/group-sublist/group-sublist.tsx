import { useCallback } from 'react';

import { useWizardContext } from '../../wizard-context';
import { ConfiguredAdapter, Units } from '../../wizard-context/proof-of-life';
import { GroupSublistItem } from '../group-sublist-item';
import { NewAdapterPopover } from '../new-adapter-popover';
import { PlusButton } from '../plus-button';
import { Adapter } from '../../../../services/adapters';

import styles from './styles.module.scss';

export const GroupSublist = ({ items, groupIndex }: { items: Array<ConfiguredAdapter>; groupIndex: number }) => {
  const { proofOfLife } = useWizardContext();

  const addNewAdapter = useCallback(
    ({ adapter, adapterId }: { adapter: Adapter; adapterId: string }) => {
      proofOfLife.addToGroup({ ...adapter, adapterId, time: 5, unit: Units.Months }, groupIndex);
    },
    [proofOfLife, groupIndex],
  );

  return (
    <ul className={styles.subList}>
      {items.map((adapter, i) => (
        <GroupSublistItem adapter={adapter} itemIndex={i} groupIndex={groupIndex} key={i} />
      ))}
      <li>
        <NewAdapterPopover onNewAdapter={addNewAdapter}>
          <PlusButton label="or" />
        </NewAdapterPopover>
      </li>
    </ul>
  );
};
