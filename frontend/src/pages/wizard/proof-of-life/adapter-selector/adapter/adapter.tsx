import { useCallback } from 'react';
import { Adapters } from '../../../wizard-context/proof-of-life';

import styles from './styles.module.scss';

type Props = {
  image: string;
  name: string;
  value: Adapters;
  onClick: (value: Adapters) => void;
};

export const Adapter = ({ image, name, onClick, value }: Props) => {
  const handleClick = useCallback(() => onClick(value), [value, onClick]);
  return (
    <button className={styles.box} onClick={handleClick}>
      <img src={image} className={styles.adapterImage} alt={name} />
      <span className={styles.adapterName}>{name}</span>
    </button>
  );
};
