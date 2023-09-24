import { PropsWithChildren } from 'react';

import styles from './styles.module.scss';

type Props = PropsWithChildren<{}>;

export const Container = ({ children }: Props) => <div className={styles.container}>{children}</div>;
