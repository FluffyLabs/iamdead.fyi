import { Card, Heading, Pre, majorScale } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Loader } from '../../components/loader';
import { Navigation } from '../../components/navigation';
import { useUser } from '../../hooks/use-user';

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
          <Card
            elevation={1}
            padding={majorScale(2)}
          >
            <Pre>{JSON.stringify(me, null, 2)}</Pre>
          </Card>
        )}
      </Container>
    </>
  );
};
