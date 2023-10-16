import { useCallback } from 'react';
import { ConfiguredAdapter } from '../../hooks/use-proof-of-life';
import { DraggableNumber } from '../../../../../components/draggable-number';
import { CrossIcon, Heading, IconButton, Pane } from 'evergreen-ui';

import styles from './group-sublist-item.module.scss';

type Props = {
  adapter: ConfiguredAdapter;
  itemIndex: number;
  groupIndex: number;
  updateGroupItem: (arg0: { groupIndex: number; itemIndex: number; item: ConfiguredAdapter | null }) => void;
};

export const GroupSublistItem = ({ adapter, itemIndex, groupIndex, updateGroupItem }: Props) => {
  const handleChange = useCallback(
    (months: number) => {
      const newItem: ConfiguredAdapter = { ...adapter, months };
      updateGroupItem({ item: newItem, groupIndex, itemIndex });
    },
    [updateGroupItem, adapter, groupIndex, itemIndex],
  );

  const removeAdapter = useCallback(() => {
    updateGroupItem({ groupIndex, itemIndex, item: null });
  }, [updateGroupItem, groupIndex, itemIndex]);

  return (
    <Pane
      textOverflow="ellipsis"
      className={styles.pane}
    >
      <Heading size={300}>
        {adapter.text} {adapter.icon} {adapter.name} for
        <DraggableNumber
          value={adapter.months}
          onChange={handleChange}
          max={60}
          min={1}
        />
        {adapter.months === 1 ? 'month' : 'months'}
        <IconButton
          className={styles.button}
          onClick={removeAdapter}
          appearance="minimal"
          icon={<CrossIcon />}
        />
      </Heading>
    </Pane>
  );
};
