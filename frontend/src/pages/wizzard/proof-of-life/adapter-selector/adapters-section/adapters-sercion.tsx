import { Adapters } from '../../../wizzard-context/proof-of-life';
import { Adapter } from '../adapter/adapter';
import { AdapterItem } from '../types';

import styles from './styles.module.scss';

type Props = {
  title: string;
  adapters: Array<AdapterItem>;
  onClick: (value: Adapters) => void;
};

export const AdaptersSection = ({ title, adapters, onClick }: Props) => {
  return (
    <div>
      <h3>{title}</h3>
      <div className={styles.wrapper}>
        {adapters.map(({ image, name, value }) => (
          <Adapter key={value} image={image} name={name} onClick={onClick} value={value} />
        ))}
      </div>
    </div>
  );
};
