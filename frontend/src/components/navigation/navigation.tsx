import { Pane, majorScale, Button } from 'evergreen-ui';
import logoWide from './logo256-wide-transparent.png';

export const Navigation = () => {
  return (
    <Pane display="flex" padding={majorScale(3)} justifyContent="space-between" alignItems="center" height="195px">
      <a href="/">
        <img src={logoWide} alt="ICOD logo" style={{ borderRadius: `${majorScale(3)}px` }} />
      </a>
      <Pane>
        <Button is="a" margin={8} href="/wizard" size="large">
          Wizard
        </Button>
        <Button is="a" margin={8} href="/dev" size="large">
          Devtools
        </Button>
        <Button is="a" margin={8} href="/login" size="large">
          Login
        </Button>
      </Pane>
    </Pane>
  );
};
