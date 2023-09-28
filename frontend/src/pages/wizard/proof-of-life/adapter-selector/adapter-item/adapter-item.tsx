import { useCallback } from 'react';

import { Adapter } from '../../../../../services/adapters';

import styles from './styles.module.scss';

type Props = {
  onClick: (value: Adapter) => void;
  adapter: Adapter;
};

export const AdapterItem = ({ adapter, onClick }: Props) => {
  const handleClick = useCallback(() => onClick(adapter), [adapter, onClick]);
  return (
    <button className={styles.box} onClick={handleClick}>
      <img src={adapter.image} className={styles.adapterImage} alt={adapter.name} />
      <span className={styles.adapterName}>{adapter.name}</span>
    </button>
  );
};
