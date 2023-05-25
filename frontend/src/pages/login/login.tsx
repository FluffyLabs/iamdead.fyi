import { Outlet } from 'react-router-dom';

import { useDefaultSubpath } from '../../hooks/use-default-subpath';

import styles from './styles.module.scss';

const DEFAULT_AUTH_ROUTE = '/login/indie-auth';

export const Login = () => {
  useDefaultSubpath(DEFAULT_AUTH_ROUTE);

  return (
    <div className={styles.bgImg}>
      <Outlet />
    </div>
  );
};
