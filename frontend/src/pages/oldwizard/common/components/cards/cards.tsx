import { useWizardContext } from '../../../wizard-context';
import { CardItem } from './card-item';

import styles from './styles.module.scss';

type Props = {
  onClick?: (id: number) => void;
};

export const Cards = ({ onClick }: Props) => {
  const { security } = useWizardContext();

  return (
    <div className={styles.cards}>
      {security.keyPieces.map((_keyPiece, i) => (
        <CardItem key={i} id={i} onClick={onClick} />
      ))}
    </div>
  );
};
