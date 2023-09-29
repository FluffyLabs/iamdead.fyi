import { Outlet } from 'react-router-dom';
import { Button, Group, Pane } from 'evergreen-ui';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';
import { Navigation } from '../../components/navigation';

export const DevTools = () => {
  useDefaultSubpath('/dev/editor');

  return (
    <>
      <Navigation />
      <Pane border>
        <Group>
          <Button is="a" href="/dev/editor" size="large">
            Secure
          </Button>
          <Button is="a" href="/dev/recover" size="large">
            Recover
          </Button>
        </Group>
      </Pane>
      <Outlet />
    </>
  );
};
