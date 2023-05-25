import { Outlet } from 'react-router-dom';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';

const DEFAULT_WIZZARD_ROUTE = '/wizzard/security';

export const Wizzard = () => {
  useDefaultSubpath(DEFAULT_WIZZARD_ROUTE);

  return (
    <div>
      <Outlet />
    </div>
  );
};
