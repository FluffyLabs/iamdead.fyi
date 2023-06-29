import { clsx } from 'clsx';
import { useCallback } from 'react';

import { Card } from '../../../icons';

import styles from './styles.module.scss';
import { useWizzardContext } from '../../../wizzard-context';

type Props = {
  onClick?: (id: number) => void;
};

export const Cards = ({ onClick }: Props) => {
  const { security } = useWizzardContext();

  return (
    <div className={styles.cards}>
      {security.keyPieces.map((_keyPiece, i) => (
        <CardItem key={i} id={i} onClick={onClick} />
      ))}
    </div>
  );
};

const CardItem = ({
  id,
  onClick,
}: {
  onClick?: (id: number) => void;
  id: number;
}) => {
  const handleCardClick = useCallback(() => {
    onClick?.(id);
  }, [onClick, id]);
  return (
    <div className="relative">
      <Card
        style={{ width: '100px', height: '100px' }}
        onClick={handleCardClick}
        className={clsx({ [styles.clickable]: !!onClick })}
      />
      <span className={styles.label}>{id + 1}</span>
    </div>
  );
};
