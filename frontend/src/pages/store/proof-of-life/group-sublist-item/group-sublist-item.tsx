import { useCallback } from 'react';
import { ConfiguredAdapter } from '../../wizard-context/proof-of-life';
import { DraggableNumber } from '../../../../components/draggable-number';
import { isMessageAdapter, isSocialAdapter } from '../utils';

const getText = (adapter: ConfiguredAdapter) => {
  if (isMessageAdapter(adapter)) {
    return `I don't respond to ${adapter.name} for`;
  }

  if (isSocialAdapter(adapter)) {
    return `I am not active on ${adapter.name} for`;
  }

  return '';
};

type Props = {
  adapter: ConfiguredAdapter;
  itemIndex: number;
  groupIndex: number;
  updateGroupItem: (arg0: { groupIndex: number; itemIndex: number; item: ConfiguredAdapter }) => void;
};

export const GroupSublistItem = ({ adapter, itemIndex, groupIndex, updateGroupItem }: Props) => {
  const handleChange = useCallback(
    (time: number) => {
      const newItem: ConfiguredAdapter = { ...adapter, time };
      updateGroupItem({ item: newItem, groupIndex, itemIndex });
    },
    [updateGroupItem, adapter, groupIndex, itemIndex],
  );

  return (
    <li>
      {itemIndex > 0 && 'or '}
      {getText(adapter)} <DraggableNumber value={adapter.time} onChange={handleChange} max={60} min={1} />
      {adapter.unit}
    </li>
  );
};
