import { Heading } from 'evergreen-ui';
import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';

export const Store = () => {
  return (
    <>
      <Navigation />
      <Container>
        <Heading size={700}>Store the message in our cloud.</Heading>
      </Container>
    </>
  );
};
