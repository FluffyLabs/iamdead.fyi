import { Pane, majorScale, Link } from 'evergreen-ui';
import logoWide from './logo256-wide-transparent.png';
import { ReactNode } from 'react';
import styles from './styles.module.scss';
import { useIsActive } from '../../hooks/use-is-active';
import clsx from 'clsx';

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const isActive = useIsActive(href);
  return (
    <Link
      className={clsx(styles.navLink, isActive ? styles.active : null)}
      borderRadius={majorScale(1)}
      margin={majorScale(1)}
      href={href}
      size="large"
      padding={majorScale(2)}
    >
      {children}
    </Link>
  );
};

export const Navigation = () => {
  return (
    <Pane display="flex" padding={majorScale(3)} justifyContent="space-between" alignItems="center" height="195px">
      <a href="/">
        <img src={logoWide} alt="ICOD logo" style={{ borderRadius: `${majorScale(3)}px` }} width="256" height="118" />
      </a>
      <Pane>
        <NavLink href="/wizard">Wizard</NavLink>
        <NavLink href="/dev">Devtools</NavLink>
        <NavLink href="/login">Login</NavLink>
      </Pane>
    </Pane>
  );
};
