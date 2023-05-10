import { useEffect } from 'react';
import { Loader } from '../../../components/loader';
import { useProfileParams } from './hooks';

import styles from './indie-auth-redirect.module.scss';

export const IndieAuthRedirect = () => {
  const profileParams = useProfileParams();
  useEffect(() => {
    console.log(profileParams);
  }, [profileParams]);
  return (
    <div className={styles.container}>
      <Loader />
    </div>
  );
}