import { useCallback, useEffect, useState } from 'react';

import { GroupSublistItem } from './group-sublist-item';
import { Adapter, ConfiguredAdapter, MAX_AND_ITEMS } from '../../../../services/adapters';
import { Button, Heading, PlusIcon, majorScale } from 'evergreen-ui';
import { AdapterSelector } from '../adapter-selector';
import React from 'react';

export const GroupSublist = ({
  items,
  groupIndex,
  addToGroup,
  updateGroupItem,
}: {
  items: ConfiguredAdapter[];
  groupIndex: number;
  addToGroup: (arg0: { adapter: Adapter; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter | null; groupIndex: number; itemIndex: number }) => void;
}) => {
  const [showMore, setShowMore] = useState(false);

  const handleClick = useCallback(() => {
    setShowMore(true);
  }, [setShowMore]);
  // reset show more after items change.
  useEffect(() => {
    setShowMore(false);
  }, [items]);

  const addNewAdapter = useCallback(
    ({ adapter }: { adapter: Adapter }) => {
      addToGroup({ adapter, groupIndex });
    },
    [addToGroup, groupIndex],
  );

  const isAlreadyAdded = useCallback(
    (adapter: Adapter) => {
      return items.findIndex((x) => x.kind === adapter.kind) !== -1;
    },
    [items],
  );

  const and = (
    <Heading
      size={300}
      marginY={majorScale(1)}
    >
      and
    </Heading>
  );

  const addMore = showMore ? (
    <>
      {and}
      <AdapterSelector
        short
        filterOut={isAlreadyAdded}
        onChange={addNewAdapter}
      />
    </>
  ) : (
    <Button
      appearance="minimal"
      iconBefore={<PlusIcon />}
      onClick={handleClick}
    >
      and
    </Button>
  );

  return (
    <>
      {items.map((adapter, i) => (
        <React.Fragment key={i}>
          {i > 0 && and}
          <GroupSublistItem
            adapter={adapter}
            itemIndex={i}
            groupIndex={groupIndex}
            updateGroupItem={updateGroupItem}
          />
        </React.Fragment>
      ))}
      {items.length < MAX_AND_ITEMS && addMore}
    </>
  );
};
