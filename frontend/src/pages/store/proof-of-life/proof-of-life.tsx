import { AdapterSelector } from './components/adapter-selector';
import { GroupList } from './components/group-list';
import { Adapter } from '../../../services/adapters';
import { Heading, InfoSignIcon, Pane, majorScale, Tooltip, Text, Paragraph } from 'evergreen-ui';
import { Box } from './components/box';
import { ConfiguredAdapter } from './hooks/use-proof-of-life';
import { DraggableNumber } from '../../../components/draggable-number';
import { Slab } from '../../../components/slab';

type Props = {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter }) => void;
  addToGroup: (arg0: { adapter: Adapter; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter | null; groupIndex: number; itemIndex: number }) => void;
  gracePeriod: number;
  setGracePeriod: (a0: number) => void;
};

export const ProofOfLife = ({
  adapters,
  addNewAdapterGroup,
  addToGroup,
  updateGroupItem,
  gracePeriod,
  setGracePeriod,
}: Props) => {
  return (
    <>
      <Paragraph>
        Decide under what conditions the pieces will be distributed to the recipients. More detailed configuration will
        be available after you sign in.
      </Paragraph>
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
    </>
  );
};
