import { Key, KeyPerson } from '../icons';
import { MULTIPLICATION_CHAR } from '../common/consts';
import { useWizzard, useWizzardContext } from '../wizzard-context';
import { Cards } from '../common/components/cards';

import styles from './styles.module.scss';

export const Recipients = () => {
  return (
    <div>
      <SecuritySummary />
      <Cards />
    </div>
  );
};

const SecuritySummary = () => {
  const { security } = useWizzardContext();
  return (
    <div className={styles.summary}>
      <KeyPerson style={{ width: '100px', height: '100px' }} />
      {MULTIPLICATION_CHAR}
      {security.noOfRecipients.value}
      <span className="mx-3">+</span>
      <Key style={{ width: '100px', height: '100px' }} />
      {MULTIPLICATION_CHAR}
      {security.noOfAdditionalPieces.value}
    </div>
  );
};
