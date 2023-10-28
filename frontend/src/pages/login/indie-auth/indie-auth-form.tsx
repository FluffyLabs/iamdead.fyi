import { Pane } from 'evergreen-ui';
import { IndieAuth } from '../../../components/sign-in/sign-in';

export const IndieAuthForm = () => {
  return (
    <Pane
      maxWidth="40vw"
      marginX="auto"
    >
      <IndieAuth />
    </Pane>
  );
};
