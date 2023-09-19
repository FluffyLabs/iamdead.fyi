import { PropsWithChildren } from 'react';
import { CrossIcon, IconButton, Pane, Popover, Position } from 'evergreen-ui';
import { AdapterSelector } from '../adapter-selector';
import { Adapters } from '../../wizzard-context/proof-of-life';
import { AdapterItem } from '../adapter-selector/types';

import styles from './styles.module.scss';

type Props = PropsWithChildren<{
  adapters: {
    socialMediaAdapters: Array<AdapterItem>;
    messageAdapters: Array<AdapterItem>;
  };
  onNewAdapter: (value: { adapter: Adapters; adapterId: string }) => void;
}>;

export const NewAdapterPopover = ({
  adapters,
  onNewAdapter,
  children,
}: Props) => {
  return (
    <Popover
      bringFocusInside
      shouldCloseOnExternalClick={false}
      position={Position.BOTTOM_LEFT}
      content={({ close }) => (
        <Pane className={styles.pane}>
          <IconButton
            className={styles.closeIcon}
            icon={<CrossIcon />}
            onClick={close}
          />
          <AdapterSelector
            adapters={{
              socialMediaAdapters: adapters.socialMediaAdapters,
              messageAdapters: adapters.messageAdapters,
            }}
            onChange={(e) => {
              onNewAdapter(e);
              close();
            }}
          />
        </Pane>
      )}
    >
      {children}
    </Popover>
  );
};
