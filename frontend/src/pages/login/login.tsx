import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import styles from './styles.module.scss';

const DEFAULT_AUTH_ROUTE = '/login/indie-auth';

export const Login = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const pathFragments = pathname.split('/').filter((pathFragment) => !!pathFragment);
    const isAuthMethodSelected = pathFragments.length > 1;
    if (!isAuthMethodSelected) {
      navigate(DEFAULT_AUTH_ROUTE);
    }
  }, [pathname, navigate]);

  return (
    <div className={styles.bgImg}>
      <Outlet />
    </div>
  );
};
