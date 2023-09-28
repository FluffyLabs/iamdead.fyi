import React from 'react';
import { Pane, Heading, Link } from 'evergreen-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

export const Footer = () => {
  return (
    <Pane padding={16} background="tint2" display="flex" justifyContent="space-around">
      <Pane flexDirection="column">
        <Heading size={500}>Legal</Heading>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </Pane>
      <Pane flexDirection="column">
        <Heading size={500}>Contact</Heading>
        <Link href="/contact">Contact Us</Link>
        <Link href="/support">Support</Link>
      </Pane>
      <Pane flexDirection="column" alignItems="center">
        <Heading size={500}>Social</Heading>
        <Link href="https://facebook.com">
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </Link>
        <Link href="https://twitter.com">
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </Link>
        <Link href="https://instagram.com">
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </Link>
      </Pane>
    </Pane>
  );
};
