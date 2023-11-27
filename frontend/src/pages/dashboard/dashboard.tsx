import { Heading, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Loader } from '../../components/loader';
import { Navigation } from '../../components/navigation';
import { useUser } from './hooks';

export const Dashboard = () => {
  const { isLoading, me, isSuccess } = useUser();

  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Dashboard
        </Heading>
        {isLoading && <Loader />}
        {isSuccess && (
          <div>
            <h2>User: </h2>
            <pre>{JSON.stringify(me, null, 2)}</pre>
          </div>
        )}
      </Container>
    </>
  );
};
