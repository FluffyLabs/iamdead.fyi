import { Loader } from '../../../components/loader';
import { useIndieAuthAuthorization } from './hooks';

import styles from './indie-auth-redirect.module.scss';

export const IndieAuthRedirect = () => {
  const { isLoading } = useIndieAuthAuthorization();

  return <div className={styles.container}>{isLoading && <Loader />}</div>;
};
