import { Alert, Link, majorScale, Paragraph, Text } from 'evergreen-ui';
import { useIsOnline } from '../../../hooks/use-is-online';
import { Loader } from '../../../components/loader';

export const OfflineWarning = ({ isLoading }: { isLoading: boolean }) => {
  const isOnline = useIsOnline();
  if (isOnline) {
    if (!isLoading) {
      return <Loader />;
    }
    return (
      <Alert
        intent="warning"
        title="Watch out! You seem to be connected to the internet."
        marginBottom={majorScale(3)}
      >
        <Paragraph>
          Note the encryption process happens fully on your computer, there is{' '}
          <strong>no data being sent to any external server</strong>.
        </Paragraph>

        <Paragraph>
          We recommend to stay off-line during message preparation.{' '}
          <Link href="/safety">Learn more about the recommended setup.</Link>
        </Paragraph>
      </Alert>
    );
  }

  return (
    <Alert
      intent="success"
      title="Your browser is off-line."
      marginBottom={majorScale(3)}
    >
      <Text>
        Make sure to read more about the <Link href="/safety">recommended setup.</Link>
      </Text>
    </Alert>
  );
};
