import { Outlet } from 'react-router-dom';
import { Button, Group, Pane } from 'evergreen-ui';
import { useDefaultSubpath } from '../../hooks/use-default-subpath';

export const DevTools = () => {
  useDefaultSubpath('/dev/editor');

  return (
    <>
      <Pane padding="20px" border>
        <Group>
          <Button is="a" href="/dev/editor">
            Secure
          </Button>
          <Button is="a" href="/dev/recover">
            Recover
          </Button>
        </Group>
      </Pane>
      <Outlet />
    </>
  );
};
