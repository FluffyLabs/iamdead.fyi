import { useState, useMemo, useCallback } from 'react';
import { Adapter } from '../../../../services/adapters';

export type ConfiguredAdapter = Adapter & {
  months: number;
};

export const getAdapterText = (adapter: Adapter) => {
  if (adapter.type === 'message') {
    return `I don't respond on ${adapter.name}`;
  }

  if (adapter.type === 'social') {
    return `I am not active on ${adapter.name}`;
  }
};

export const createAdapter = (adapter: Adapter, months: number): ConfiguredAdapter => ({
  ...adapter,
  months,
});

const list: Array<Array<ConfiguredAdapter>> = [];

export function useProofOfLife() {
  const [listOfAdapters, setListOfAdapters] = useState<Array<Array<ConfiguredAdapter>>>(list);

  const addNewGroup = useCallback(
    (item: ConfiguredAdapter) => {
      setListOfAdapters((previousList) => [...previousList, [item]]);
    },
    [setListOfAdapters],
  );

  const addToGroup = useCallback(
    (item: ConfiguredAdapter, groupIndex: number) => {
      setListOfAdapters((previousList) => {
        const newList = [...previousList];
        newList[groupIndex] = [...newList[groupIndex], item];
        return newList;
      });
    },
    [setListOfAdapters],
  );

  const removeFromGroup = useCallback(
    (groupIndex: number, itemIndex: number) => {
      setListOfAdapters((previousList) => {
        const newList = [...previousList];
        newList[groupIndex] = [...newList[groupIndex]];
        newList[groupIndex].splice(itemIndex, 1);
        return newList;
      });
    },
    [setListOfAdapters],
  );

  const updateGroupItem = useCallback(
    (item: ConfiguredAdapter, groupIndex: number, itemIndex: number) => {
      setListOfAdapters((previousList) => {
        const newList = [...previousList];
        newList[groupIndex] = [...newList[groupIndex]];
        newList[groupIndex][itemIndex] = item;
        return newList;
      });
    },
    [setListOfAdapters],
  );

  return useMemo(
    () => ({
      listOfAdapters,
      addNewGroup,
      addToGroup,
      removeFromGroup,
      updateGroupItem,
    }),
    [listOfAdapters, addNewGroup, addToGroup, removeFromGroup, updateGroupItem],
  );
}
