import { PropsWithChildren } from 'react';

import styles from './styles.module.scss';
import { Slab } from '../slab';
import clsx from 'clsx';

type Props = PropsWithChildren<{
  noBackground?: boolean;
}>;

export const Container = ({ children, noBackground }: Props) => {
  return <Slab className={clsx(styles.container, noBackground && styles.noBackground)}>{children}</Slab>;
};
