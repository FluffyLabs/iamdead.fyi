import { Outlet } from 'react-router-dom';
import { Button, Group, Pane } from 'evergreen-ui';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { Navigation } from '../../components/navigation';
import { ReactNode } from 'react';
import { useIsActive } from '../../hooks/use-is-active';

const SubNavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const isActive = useIsActive(href);

  return (
    <Button is="a" href={href} size="large" appearance={isActive ? 'primary' : undefined}>
      {children}
    </Button>
  );
};

export const DevTools = () => {
  useDefaultSubpath('/dev/editor');

  return (
    <>
      <Navigation />
      <Pane border display="flex" justifyContent="center">
        <Group>
          <SubNavLink href="/dev/editor">Secure</SubNavLink>
          <SubNavLink href="/dev/recover">Recover</SubNavLink>
        </Group>
      </Pane>
      <Outlet />
    </>
  );
};
