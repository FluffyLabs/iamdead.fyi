import { ConfiguredAdapter } from '../wizard-context/proof-of-life';
import { AdapterSelector } from './adapter-selector';
import { GroupList } from './group-list';
import { Adapter } from '../../../services/adapters';

import styles from './styles.module.scss';

export const ProofOfLifeComponent = ({
  adapters,
  addNewAdapterGroup,
  addToGroup,
  updateGroupItem,
}: {
  adapters: ConfiguredAdapter[][];
  addNewAdapterGroup: (arg0: { adapter: Adapter; adapterId: string }) => void;
  addToGroup: (arg0: { adapter: Adapter; adapterId: string; groupIndex: number }) => void;
  updateGroupItem: (arg0: { item: ConfiguredAdapter; groupIndex: number; itemIndex: number }) => void;
}) => {
  return (
    <div>
      {adapters.length > 0 && (
        <>
          <h2 className={styles.header}>I want the pieces to be sent when:</h2>
          <GroupList
            adapters={adapters}
            addNewAdapterGroup={addNewAdapterGroup}
            addToGroup={addToGroup}
            updateGroupItem={updateGroupItem}
          />
        </>
      )}
      {adapters.length === 0 && <AdapterSelector onChange={addNewAdapterGroup} />}
    </div>
  );
};
