import { Pane, Spinner } from 'evergreen-ui';

export const Loader = () => (
  <Pane
    display="flex"
    alignItems="center"
    justifyContent="center"
    height={400}
  >
    <Spinner />
  </Pane>
);
