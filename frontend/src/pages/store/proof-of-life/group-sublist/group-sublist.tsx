import { useCallback } from 'react';

import { ConfiguredAdapter } from '../../wizard-context/proof-of-life';
import { GroupSublistItem } from '../group-sublist-item';
import { NewAdapterPopover } from '../new-adapter-popover';
import { PlusButton } from '../plus-button';
import { Adapter } from '../../../../services/adapters';

import styles from './styles.module.scss';

export const GroupSublist = ({
  items,
  groupIndex,
  addToGroup,
  updateGroupItem,
}: {
  items: Array<ConfiguredAdapter>;
  groupIndex: number;
  addToGroup: (arg0: { adapter: Adapter; adapterId: string; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter; groupIndex: number; itemIndex: number }) => void;
}) => {
  const addNewAdapter = useCallback(
    ({ adapter, adapterId }: { adapter: Adapter; adapterId: string }) => {
      addToGroup({ adapter, adapterId, groupIndex });
    },
    [addToGroup, groupIndex],
  );

  return (
    <ul className={styles.subList}>
      {items.map((adapter, i) => (
        <GroupSublistItem
          adapter={adapter}
          itemIndex={i}
          groupIndex={groupIndex}
          key={i}
          updateGroupItem={updateGroupItem}
        />
      ))}
      <li>
        <NewAdapterPopover onNewAdapter={addNewAdapter}>
          <PlusButton label="or" />
        </NewAdapterPopover>
      </li>
    </ul>
  );
};
