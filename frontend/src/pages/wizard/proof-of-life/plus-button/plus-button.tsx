import { forwardRef } from 'react';

import styles from './styles.module.scss';

type Props = {
  label: 'or' | 'and';
};

export const PlusButton = forwardRef<HTMLButtonElement, Props>(({ label, ...props }, ref) => (
  <button {...props} className={styles.button} ref={ref}>
    + {label}
  </button>
));
