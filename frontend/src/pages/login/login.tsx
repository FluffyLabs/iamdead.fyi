import { Outlet } from 'react-router-dom';

import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';

const DEFAULT_AUTH_ROUTE = '/login/indie-auth';

export const Login = () => {
  useDefaultSubpath(DEFAULT_AUTH_ROUTE);

  return (
    <>
      <Navigation />
      <Container noBackground>
        <Outlet />
      </Container>
    </>
  );
};
