import { PropsWithChildren } from 'react';
import { CrossIcon, IconButton, Pane, Popover, Position } from 'evergreen-ui';

import { AdapterSelector } from '../adapter-selector';
import { Adapter } from '../../../../services/adapters';

import styles from './styles.module.scss';

type Props = PropsWithChildren<{
  onNewAdapter: (value: { adapter: Adapter; adapterId: string }) => void;
}>;

export const NewAdapterPopover = ({ onNewAdapter, children }: Props) => {
  return (
    <Popover
      bringFocusInside
      shouldCloseOnExternalClick={false}
      position={Position.BOTTOM_LEFT}
      content={({ close }) => (
        <Pane className={styles.pane}>
          <IconButton className={styles.closeIcon} icon={<CrossIcon />} onClick={close} />
          <AdapterSelector
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
