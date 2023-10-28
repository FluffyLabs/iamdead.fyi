import { Pane } from 'evergreen-ui';
import { SignIn } from '../../../components/sign-in';

export const IndieAuthForm = () => {
  return (
    <Pane
      maxWidth="40vw"
      marginX="auto"
    >
      <SignIn />
    </Pane>
  );
};
