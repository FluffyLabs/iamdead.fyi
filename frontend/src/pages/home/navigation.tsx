import React from 'react';
import { Pane, Heading, Link } from 'evergreen-ui';

export const Navigation = () => {
  return (
    <Pane display="flex" padding={16} background="tint2" justifyContent="space-between" alignItems="center">
      <Heading size={700}>Legacy Message</Heading>
      <Pane>
        <Link margin={8} href="/how-it-works">
          How It Works
        </Link>
        <Link margin={8} href="/pricing">
          Pricing
        </Link>
        <Link margin={8} href="/contact">
          Contact
        </Link>
        <Link margin={8} href="/login">
          Login
        </Link>
      </Pane>
    </Pane>
  );
};
