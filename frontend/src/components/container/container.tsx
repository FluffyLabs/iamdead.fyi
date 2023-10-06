import { PropsWithChildren } from 'react';

import styles from './styles.module.scss';
import { Slab } from '../slab';

type Props = PropsWithChildren<{}>;

export const Container = ({ children }: Props) => <Slab className={styles.container}>{children}</Slab>;
