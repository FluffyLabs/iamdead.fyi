import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useDefaultSubpath(defaultSubpath: string) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const pathFragments = pathname.split('/').filter((pathFragment) => !!pathFragment);
    const hasSubpathSelected = pathFragments.length > 1;
    if (!hasSubpathSelected) {
      navigate(defaultSubpath);
    }
  }, [pathname, navigate, defaultSubpath]);
}
