import { Loader } from '../../../components/loader';

import styles from './indie-auth-redirect.module.scss';

export const IndieAuthRedirect = () => {
  return (
    <div className={styles.container}>
      <Loader />
    </div>
  );
}