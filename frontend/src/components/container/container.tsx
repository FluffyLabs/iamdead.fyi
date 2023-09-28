import { PropsWithChildren } from 'react';

import styles from './styles.module.scss';
import { Pane } from 'evergreen-ui';

type Props = PropsWithChildren<{}>;

export const Container = ({ children }: Props) => <Pane className={styles.container}>{children}</Pane>;
