import { Heading, Link, majorScale, ListItem, UnorderedList } from 'evergreen-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Slab } from '../../components/slab';

export const Footer = () => {
  return (
    <Slab background="tint2" display="flex" justifyContent="space-around" marginBottom="0">
      <Slab flexDirection="column">
        <Heading size={300} marginBottom={majorScale(2)}>
          Legal
        </Heading>
        <UnorderedList>
          <ListItem>
            <Link href="/terms">Terms of Service</Link>
          </ListItem>
          <ListItem>
            <Link href="/privacy">Privacy Policy</Link>
          </ListItem>
        </UnorderedList>
      </Slab>
      <Slab flexDirection="column">
        <Heading size={300} marginBottom={majorScale(2)}>
          Contact
        </Heading>
        <UnorderedList>
          <ListItem>
            <Link href="/contact">Contact Us</Link>
          </ListItem>
          <ListItem>
            <Link href="/support">Support</Link>
          </ListItem>
        </UnorderedList>
      </Slab>
      <Slab flexDirection="column" alignItems="center">
        <Heading size={300} marginBottom={majorScale(2)}>
          Social
        </Heading>
        <Link href="https://facebook.com" margin={majorScale(1)}>
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </Link>
        <Link href="https://twitter.com" margin={majorScale(1)}>
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </Link>
        <Link href="https://instagram.com" margin={majorScale(1)}>
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </Link>
      </Slab>
    </Slab>
  );
};
