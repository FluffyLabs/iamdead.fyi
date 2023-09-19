import { useState, useMemo, useCallback } from 'react';

export type ConfiguredAdapter = {
  adapter: Adapters;
  time: number;
  unit: Units;
};

export enum Adapters {
  Email = 'email',
  Telegram = 'telegram',
  Twitter = 'twitter',
  Whatsapp = 'whatsapp',
}

export enum Units {
  Months = 'months',
}

export const createAdapter = (
  adapter: Adapters,
  time: number,
  unit = Units.Months,
): ConfiguredAdapter => ({
  adapter,
  time,
  unit,
});

const list = [
  [createAdapter(Adapters.Email, 2), createAdapter(Adapters.Telegram, 2)],
  [createAdapter(Adapters.Twitter, 2), createAdapter(Adapters.Whatsapp, 2)],
  [createAdapter(Adapters.Twitter, 2), createAdapter(Adapters.Email, 2)],
];

export function useProofOfLifeStep() {
  const [listOfAdapters, setListOfAdapters] =
    useState<Array<Array<ConfiguredAdapter>>>(list);

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
        newList[groupIndex] = [...newList[groupIndex]];
        newList[groupIndex].push(item);
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
