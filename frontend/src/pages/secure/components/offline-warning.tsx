import { Alert, Link, majorScale, Text } from 'evergreen-ui';
import { useIsOnline } from '../../../hooks/use-is-online';

export const OfflineWarning = () => {
  const isOnline = useIsOnline();
  if (isOnline) {
    return (
      <Alert intent="warning" title="Watch out! You seem to be connected to the internet." marginBottom={majorScale(3)}>
        <Text>
          We recommend to stay off-line during message preparation.{' '}
          <Link href="/safety">Learn more about the recommended setup.</Link>
        </Text>
      </Alert>
    );
  }

  return (
    <Alert intent="success" title="Your browser is off-line." marginBottom={majorScale(3)}>
      <Text>
        Make sure to read more about the <Link href="/safety">recommended setup.</Link>
      </Text>
    </Alert>
  );
};
