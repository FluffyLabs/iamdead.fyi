import React from 'react';

import { Adapter } from '../../../../../services/adapters';
import { Button, PlusIcon } from 'evergreen-ui';
import { Box } from '../box';
import { ConfiguredAdapter } from '../../hooks/use-proof-of-life';
import { AdapterSelector } from '../adapter-selector';
import { GroupSublist } from './group-sublist';

// TODO [ToDr] Change to props
export const GroupList = ({
  adapters,
  addNewAdapterGroup,
  addToGroup,
  updateGroupItem,
}: {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter }) => void;
  addToGroup: (arg0: { adapter: Adapter; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter; groupIndex: number; itemIndex: number }) => void;
}) => {
  return (
    <>
      {adapters.map((group, i) => (
        <React.Fragment key={i}>
          <Box textAlign="center">
            <GroupSublist items={group} groupIndex={i} addToGroup={addToGroup} updateGroupItem={updateGroupItem} />
          </Box>
          {i < adapters.length - 1 && <PlusIcon />}
        </React.Fragment>
      ))}
      <PlusIcon />
      <Box>
        <AdapterSelector onChange={(arg0: any) => {}} />
      </Box>
    </>
  );
};
