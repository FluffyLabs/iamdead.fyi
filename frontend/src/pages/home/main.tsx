import React from 'react';
import { Pane, Heading, Button, Text } from 'evergreen-ui';

export const MainPage = () => {
  return (
    <Pane>
      <Pane
        display="flex"
        padding={16}
        background="tint2"
        borderRadius={3}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Heading size={700}>Legacy Message</Heading>
        <Text>Your final words, delivered when they matter most.</Text>
      </Pane>
      <Pane margin={32} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <Text>How It Works:</Text>
        <Pane padding={16} background="tint1" borderRadius={3} marginTop={16}>
          <Text>1. Create an account and set up your message.</Text>
          <Text>2. Choose the recipients and schedule your message.</Text>
          <Text>3. Provide periodic “Proof of Life” to ensure your message is held.</Text>
          <Text>4. Rest easy knowing your message will reach your loved ones.</Text>
        </Pane>
      </Pane>
      <Pane display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        <Button appearance="primary">Get Started</Button>
      </Pane>
    </Pane>
  );
};
