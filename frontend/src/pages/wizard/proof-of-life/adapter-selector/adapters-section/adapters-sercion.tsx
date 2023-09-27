import { Adapter } from '../../../../../services/adapters';
import { AdapterItem } from '../adapter-item';

import styles from './styles.module.scss';

type Props = {
  title: string;
  adapters: Array<Adapter>;
  onClick: (value: Adapter) => void;
};

export const AdaptersSection = ({ title, adapters, onClick }: Props) => {
  return (
    <div>
      <h3>{title}</h3>
      <div className={styles.wrapper}>
        {adapters.map((adapter) => (
          <AdapterItem key={adapter.id} adapter={adapter} onClick={onClick} />
        ))}
      </div>
    </div>
  );
};
