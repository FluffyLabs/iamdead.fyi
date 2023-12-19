import { Card, Heading, Pre, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Loader } from '../../components/loader';
import { Navigation } from '../../components/navigation';
import { useUser } from '../../hooks/user/use-user';
import { useTestaments } from '../../hooks/user/use-testaments';

export const Dashboard = () => {
  const { isLoading, me, isSuccess } = useUser();
  const { testaments } = useTestaments();

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
          <Card
            elevation={1}
            padding={majorScale(2)}
          >
            <Pre>{JSON.stringify(me, null, 2)}</Pre>
          </Card>
        )}
        <hr />
        <Pre>{JSON.stringify(testaments, null, 2)}</Pre>
      </Container>
    </>
  );
};
