import { AdapterSelector } from './components/adapter-selector';
import { GroupList } from './components/group-list';
import { Adapter } from '../../../services/adapters';
import { Heading, InfoSignIcon, Pane, majorScale, Tooltip, Text } from 'evergreen-ui';
import { Box } from './components/box';
import { ConfiguredAdapter } from './hooks/use-proof-of-life';
import { DraggableNumber } from '../../../components/draggable-number';
import { useState } from 'react';
import { Slab } from '../../../components/slab';

export const ProofOfLifeComponent = ({
  adapters,
  addNewAdapterGroup,
  addToGroup,
  updateGroupItem,
}: {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter }) => void;
  addToGroup: (arg0: { adapter: Adapter; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter | null; groupIndex: number; itemIndex: number }) => void;
}) => {
  const [gracePeriod, setGracePeriod] = useState(1);

  return (
    <Slab background="tint2">
      <Heading
        size={500}
        marginBottom={majorScale(1)}
      >
        The pieces should be sent out when:
      </Heading>
      <Pane
        display="flex"
        flexWrap="wrap"
      >
        {adapters.length > 0 ? (
          <GroupList
            adapters={adapters}
            addNewAdapterGroup={addNewAdapterGroup}
            addToGroup={addToGroup}
            updateGroupItem={updateGroupItem}
          />
        ) : (
          <Box>
            <AdapterSelector onChange={addNewAdapterGroup} />
          </Box>
        )}
      </Pane>
      <Heading
        size={400}
        marginTop={majorScale(2)}
      >
        followed by a grace period of{' '}
        <DraggableNumber
          value={gracePeriod}
          onChange={setGracePeriod}
          min={1}
          max={24}
        />{' '}
        {gracePeriod === 1 ? 'month' : 'months'}.
        <Tooltip content="During the grace period we will notify you about Proof of Life conditions being met on all possible channels, and you will still have a chance to cancel.">
          <Text opacity="0.5">
            <InfoSignIcon marginLeft={majorScale(1)} />
          </Text>
        </Tooltip>
      </Heading>
    </Slab>
  );
};
