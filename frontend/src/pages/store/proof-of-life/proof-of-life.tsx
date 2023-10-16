import { AdapterSelector } from './components/adapter-selector';
import { GroupList } from './components/group-list';
import { Adapter } from '../../../services/adapters';
import { Heading, Pane, majorScale } from 'evergreen-ui';
import { Box } from './components/box';
import { ConfiguredAdapter } from './hooks/use-proof-of-life';

export const ProofOfLifeComponent = ({
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
      <Heading size={500} marginTop={majorScale(3)} marginBottom={majorScale(1)}>
        The pieces should be sent out when:
      </Heading>
      <Pane display="flex">
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
    </>
  );
};
