import { Alert, Paragraph } from 'evergreen-ui';
import { Navigation } from '../../components/navigation';
import { Container } from '../../components/container';

export const NotFound = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Alert title="Whoops!">
          <Paragraph>Seems that the page you are looking for is not implemented yet.</Paragraph>
        </Alert>
      </Container>
    </>
  );
};
