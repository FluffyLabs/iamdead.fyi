import { Button, Link, Small, TextInputField, majorScale } from 'evergreen-ui';
import { Slab } from '../slab';
import { useAuthorizationParams } from './hooks';
import { CSSProperties, ReactNode } from 'react';

type Props = {
  header?: ReactNode;
};
export const SignIn = ({ header }: Props) => {
  const moreProps = header ? { paddingTop: 0 } : {};
  return (
    <Slab
      background={header ? undefined : 'tint2'}
      display="flex"
      flexDirection="column"
      alignItems="center"
      flex="1"
      minWidth="250px"
      {...moreProps}
    >
      {header}
      <IndieAuth />
    </Slab>
  );
};

const formStyles: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  marginBottom: majorScale(1),
};

export const IndieAuth = () => {
  const { clientId, redirectUri, state } = useAuthorizationParams();

  return (
    <form
      action="https://indieauth.com/auth"
      method="get"
      style={formStyles}
    >
      <TextInputField
        label="Your website"
        placeholder="yourdomain.com"
        name="me"
        autoFocus
        flex="1"
        width="100%"
      />
      <Button
        appearance="primary"
        flex="1"
        width="100%"
      >
        Login
      </Button>
      <input
        type="hidden"
        name="client_id"
        value={clientId}
      />
      <input
        type="hidden"
        name="redirect_uri"
        value={redirectUri}
      />
      <input
        type="hidden"
        name="state"
        value={state}
      />
      <Link
        href="https://indielogin.com/setup"
        target="_blank"
        rel="noreferrer"
        marginTop={majorScale(3)}
        textAlign="center"
        width="100%"
      >
        <Small>Learn how to set up your website</Small>
      </Link>
    </form>
  );
};
