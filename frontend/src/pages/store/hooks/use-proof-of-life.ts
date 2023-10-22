import { useState, useMemo, useCallback } from 'react';
import { Adapter, ConfiguredAdapter } from '../services/adapters';

export const createAdapter = (adapter: Adapter, months: number): ConfiguredAdapter => ({
  ...adapter,
  months,
});

const list: ConfiguredAdapter[][] = [];

export function useProofOfLife() {
  const [listOfAdapters, setListOfAdapters] = useState<ConfiguredAdapter[][]>(list);
  const [gracePeriod, setGracePeriod] = useState(1);

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
        if (newList[groupIndex].length === 0) {
          newList.splice(groupIndex, 1);
        }
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
      gracePeriod,
      setGracePeriod,
    }),
    [listOfAdapters, addNewGroup, addToGroup, removeFromGroup, updateGroupItem, gracePeriod],
  );
}
