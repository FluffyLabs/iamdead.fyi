import React, { useCallback, useEffect, useState } from 'react';

import { Adapter, MAX_OR_GROUPS } from '../../../../../services/adapters';
import { Button, Heading, PlusIcon, majorScale } from 'evergreen-ui';
import { Box } from '../box';
import { ConfiguredAdapter } from '../../hooks/use-proof-of-life';
import { AdapterSelector } from '../adapter-selector';
import { GroupSublist } from './group-sublist';

type Props = {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter }) => void;
  addToGroup: (arg0: { adapter: Adapter; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter | null; groupIndex: number; itemIndex: number }) => void;
};

export const GroupList = ({ adapters, addNewAdapterGroup, addToGroup, updateGroupItem }: Props) => {
  const [showMore, setShowMore] = useState(false);

  const hasMaxGroups = adapters.length === MAX_OR_GROUPS;

  const handleClick = useCallback(() => {
    setShowMore(true);
  }, [setShowMore]);

  // Reset show more after adapters change.
  useEffect(() => {
    setShowMore(false);
  }, [adapters]);

  const or = (
    <Heading
      size={400}
      margin={majorScale(2)}
      alignSelf="center"
    >
      or
    </Heading>
  );

  const addMore = showMore ? (
    <>
      {or}
      <Box background="white">
        <AdapterSelector onChange={addNewAdapterGroup} />
      </Box>
    </>
  ) : (
    <Button
      appearance="minimal"
      iconBefore={<PlusIcon />}
      onClick={handleClick}
      margin={majorScale(2)}
      alignSelf="center"
    >
      or
    </Button>
  );

  return (
    <>
      {adapters.map((group, i) => (
        <React.Fragment key={i}>
          {i > 0 && or}
          <Box
            textAlign="center"
            background="white"
          >
            <GroupSublist
              items={group}
              groupIndex={i}
              addToGroup={addToGroup}
              updateGroupItem={updateGroupItem}
            />
          </Box>
        </React.Fragment>
      ))}
      {!hasMaxGroups && addMore}
    </>
  );
};
