import { useCallback } from 'react';
import { ConfiguredAdapter, getAdapterText } from '../../hooks/use-proof-of-life';
import { DraggableNumber } from '../../../../../components/draggable-number';
import { CrossIcon, Heading, Pane, RemoveIcon } from 'evergreen-ui';

type Props = {
  adapter: ConfiguredAdapter;
  itemIndex: number;
  groupIndex: number;
  updateGroupItem: (arg0: { groupIndex: number; itemIndex: number; item: ConfiguredAdapter }) => void;
};

export const GroupSublistItem = ({ adapter, itemIndex, groupIndex, updateGroupItem }: Props) => {
  const handleChange = useCallback(
    (months: number) => {
      const newItem: ConfiguredAdapter = { ...adapter, months };
      updateGroupItem({ item: newItem, groupIndex, itemIndex });
    },
    [updateGroupItem, adapter, groupIndex, itemIndex],
  );

  return (
    <Pane textOverflow="ellipsis">
      <Heading size={300}>
        {getAdapterText(adapter)} for
        <DraggableNumber value={adapter.months} onChange={handleChange} max={60} min={1} />
        {adapter.months === 1 ? 'month' : 'months'}
        <CrossIcon />
      </Heading>
    </Pane>
  );
};
