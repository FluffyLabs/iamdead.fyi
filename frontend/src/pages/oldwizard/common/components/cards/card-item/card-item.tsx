import { useCallback } from 'react';
import { clsx } from 'clsx';

import { Card } from '../../../../icons';

import styles from './styles.module.scss';

type Props = {
  id: number;
  onClick?: (id: number) => void;
};

export const CardItem = ({ id, onClick }: Props) => {
  const handleCardClick = useCallback(() => {
    onClick?.(id);
  }, [onClick, id]);

  return (
    <div className={styles.container}>
      <Card onClick={handleCardClick} className={clsx(styles.card, { [styles.clickable]: !!onClick })} />
      <span className={styles.label}>{id + 1}</span>
    </div>
  );
};
