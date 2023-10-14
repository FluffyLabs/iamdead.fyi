import React, { useCallback } from 'react';

import { ConfiguredAdapter } from '../../wizard-context/proof-of-life';
import { NewAdapterPopover } from '../new-adapter-popover';
import { PlusButton } from '../plus-button';
import { GroupSublist } from '../group-sublist';
import { Adapter } from '../../../../services/adapters';

import styles from './styles.module.scss';

// TODO [ToDr] Change to props
export const GroupList = ({
  adapters,
  addNewAdapterGroup,
  addToGroup,
  updateGroupItem,
}: {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter; adapterId: string }) => void;
  addToGroup: (arg0: { adapter: Adapter; adapterId: string; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter; groupIndex: number; itemIndex: number }) => void;
}) => {
  return (
    <ul className={styles.mainList}>
      {adapters.map((group, i) => (
        <React.Fragment key={i}>
          <GroupSublist items={group} groupIndex={i} addToGroup={addToGroup} updateGroupItem={updateGroupItem} />
          {i < adapters.length - 1 && <li>and</li>}
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
