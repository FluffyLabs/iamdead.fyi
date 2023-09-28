import { useCallback } from 'react';
import { useWizardContext } from '../../wizard-context';
import { ConfiguredAdapter } from '../../wizard-context/proof-of-life';
import { DraggableNumberInput } from '../../../../components/draggable-number-input';
import { isMessageAdapter, isSocialAdapter } from '../utils';

const getText = (adapter: ConfiguredAdapter) => {
  if (isMessageAdapter(adapter)) {
    return `I don't respond to ${adapter} for`;
  }

  if (isSocialAdapter(adapter)) {
    return `I am not active on ${adapter} for`;
  }

  return '';
};

type Props = {
  adapter: ConfiguredAdapter;
  itemIndex: number;
  groupIndex: number;
};

export const GroupSublistItem = ({ adapter, itemIndex, groupIndex }: Props) => {
  const { proofOfLife } = useWizardContext();

  const item = proofOfLife.listOfAdapters[groupIndex][itemIndex];

  const handleChange = useCallback(
    (time: number) => {
      const newItem: ConfiguredAdapter = { ...item, time };
      proofOfLife.updateGroupItem(newItem, groupIndex, itemIndex);
    },
    [proofOfLife, item, groupIndex, itemIndex],
  );

  return (
    <li>
      {itemIndex > 0 && 'or '}
      {getText(adapter)} <DraggableNumberInput value={item.time} onChange={handleChange} max={60} min={1} />
      {adapter.unit}
    </li>
  );
};
