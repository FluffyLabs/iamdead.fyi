import { Card } from '../../../icons';

import styles from './styles.module.scss';
import { useWizzardContext } from '../../../wizzard-context';

export const Cards = () => {
  const { security } = useWizzardContext();

  return (
    <div className={styles.cards}>
      {security.keyPieces.map((_keyPiece, i) => (
        <CardItem key={i} label={(i + 1).toString()} />
      ))}
    </div>
  );
};

const CardItem = ({ label }: { label: string }) => {
  return (
    <div className="relative">
      <Card style={{ width: '100px', height: '100px' }} />
      <span className={styles.label}>{label}</span>
    </div>
  );
};
