import { ComponentType, PropsWithChildren, SVGProps } from 'react';

import styles from './styles.module.scss';

type Props = PropsWithChildren<{
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  counter: JSX.Element;
}>;

export const Row = ({ Icon, counter, children }: Props) => (
  <div className={styles.container}>
    <span className={styles.counterContainer}>
      <Icon className={styles.icon} />
      <span className={styles.counter}>{counter}</span>
    </span>
    <span className={styles.text}>{children}</span>
  </div>
);
