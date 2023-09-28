import { useState, useMemo, useCallback } from 'react';
import { Adapter } from '../../../services/adapters';

export type ConfiguredAdapter = Adapter & {
  adapterId: string;
  time: number;
  unit: Units;
};

export enum Units {
  Months = 'months',
}

export const createAdapter = (
  adapter: Adapter,
  adapterId: string,
  time: number,
  unit = Units.Months,
): ConfiguredAdapter => ({
  ...adapter,
  time,
  unit,
  adapterId,
});

const list: Array<Array<ConfiguredAdapter>> = [];

export function useProofOfLifeStep() {
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
