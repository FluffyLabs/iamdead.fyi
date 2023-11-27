import { Container } from '../../../components/container';
import { Loader } from '../../../components/loader';
import { useIndieAuthAuthorization } from '../../../components/sign-in/hooks';

export const IndieAuthRedirect = () => {
  const { isLoading } = useIndieAuthAuthorization();

  return (
    <>
      <Container>{isLoading && <Loader />}</Container>
    </>
  );
};
