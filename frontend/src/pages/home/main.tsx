import { Pane, Heading, Button, Text, majorScale, OrderedList, ListItem } from 'evergreen-ui';
import heroImage from './hero.jpg';
import { Slab } from '../../components/slab';

export const MainPage = () => {
  return (
    <>
      <Pane
        display="flex"
        padding={majorScale(5)}
        borderRadius={4}
        justifyContent="center"
        alignItems="flex-end"
        flexDirection="column"
        background={`url(${heroImage})`}
        backgroundSize="cover"
        style={{ backgroundAttachment: 'fixed', backgroundPositionX: 'right' }}
        height="100vh"
      >
        <Heading
          size={900}
          marginTop={majorScale(20)}
          marginBottom={majorScale(2)}
        >
          FYI: I am dead!
        </Heading>
        <Text>Your final will, delivered when it matters the most.</Text>
      </Pane>
      <Slab
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Pane
          margin={majorScale(5)}
          padding={majorScale(5)}
          background="tint1"
          borderRadius={majorScale(1)}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Heading>How It Works:</Heading>
          <OrderedList margin={majorScale(3)}>
            <ListItem>Write your last will and testatment that your loved ones should receive.</ListItem>
            <ListItem>Choose the recipients and how many of them needs to cooperate.</ListItem>
            <ListItem>
              Your browser will encrypt the message and split the encryption key using <em>Shamir Secret Sharing</em>.
            </ListItem>
            <ListItem>
              Specify <em>Proof of Life</em> - the conditions under which the parts of the key will be sent to
              recipients.
            </ListItem>
            <ListItem>
              Given the parts of the key, enough recipients will be able to decrypt and read your last will.
            </ListItem>
          </OrderedList>
          <Button
            is="a"
            appearance="primary"
            href="/store"
            size="large"
          >
            Get Started
          </Button>
        </Pane>
      </Slab>
    </>
  );
};
