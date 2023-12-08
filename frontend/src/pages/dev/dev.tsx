import {
  Button,
  Card,
  Heading,
  InlineAlert,
  Pre,
  SendMessageIcon,
  TextInput,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { Container } from '../../components/container';
import { Loader } from '../../components/loader';
import { Navigation } from '../../components/navigation';
import { useUser } from '../../hooks/user/use-user';
import { useRecipients } from '../../hooks/user/use-recipients';
import { useAdapters } from '../../hooks/user/use-adapters';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { axios } from '../../services/axios';

function useTestaments() {
  return useQuery({
    queryKey: ['testaments'],
    queryFn: ({ signal }) => axios.get('/api/me/testaments', { signal }),
    retry: false,
  });
}

export const Dev = () => {
  const { isLoading, me, isSuccess } = useUser();

  return (
    <>
      <Navigation />
      <Container>
        <Heading
          size={700}
          marginBottom={majorScale(5)}
        >
          Dev Tools
        </Heading>
        <MakeRequest />
        {isLoading && <Loader />}
        {isSuccess ? <Logged me={me} /> : <NotLogged />}
      </Container>
    </>
  );
};

function asJson(input: any) {
  return <Pre>{JSON.stringify(input, null, 2)}</Pre>;
}

function Logged({ me }: { me: any }) {
  const recipients = useRecipients().recipients;
  const adapters = useAdapters().adapters;
  const testaments = useTestaments().data?.data;

  return (
    <>
      <Card
        elevation={1}
        padding={majorScale(2)}
        margin={majorScale(2)}
      >
        <Heading size={500}>User Details</Heading>
        {asJson(me)}
      </Card>
      <Card
        elevation={1}
        padding={majorScale(2)}
        margin={majorScale(2)}
      >
        <Heading size={500}>Recipients</Heading>
        {asJson(recipients)}
      </Card>
      <Card
        elevation={1}
        padding={majorScale(2)}
        margin={majorScale(2)}
      >
        <Heading size={500}>Adapters</Heading>
        {asJson(adapters)}
      </Card>
      <Card
        elevation={1}
        padding={majorScale(2)}
        margin={majorScale(2)}
      >
        <Heading size={500}>Testaments</Heading>
        {asJson(testaments)}
      </Card>
    </>
  );
}

function NotLogged() {
  return <Heading>Not logged. No data.</Heading>;
}

function MakeRequest() {
  const [endpoint, setEndpoint] = useState('/api/me');
  const [result, setResult] = useState(null as any);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const sendRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.get(endpoint);
      setResult(res);
    } catch (e: any) {
      setResult(null);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  return (
    <Card
      elevation={2}
      padding={majorScale(3)}
      margin={majorScale(2)}
    >
      <TextInputField
        label="API endpoint"
        placeholder="/api/me"
        value={endpoint}
        onChange={(e: any) => setEndpoint(e.target.value)}
      />
      <Button
        appearance="primary"
        iconAfter={<SendMessageIcon />}
        onClick={sendRequest}
        isLoading={isLoading}
        marginBottom={majorScale(2)}
      >
        Send
      </Button>
      {error && <InlineAlert intent="danger">{error}</InlineAlert>}

      {result && asJson(result)}
    </Card>
  );
}
