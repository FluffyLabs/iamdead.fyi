import { Loader } from '../../../components/loader';
import { useIndieAuthAuthorization } from '../../../components/sign-in/hooks';

export const IndieAuthRedirect = () => {
  const { isLoading } = useIndieAuthAuthorization();

  return <div>{isLoading && <Loader />}</div>;
};
