import { majorScale, Link, Spinner } from 'evergreen-ui';
import logoWide from './logo256-wide-transparent.png';
import { ReactNode, useDeferredValue, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { useIsActive } from '../../hooks/use-is-active';
import clsx from 'clsx';
import { Slab } from '../slab';
import { useUser } from '../../hooks/use-user';
import { useBufferedSynced } from '../../hooks/use-buffered-state';

const NavLink = ({ href, children, fill }: { href: string; children: ReactNode; fill?: boolean }) => {
  const isActive = useIsActive(href);
  return (
    <Link
      className={clsx(styles.navLink, isActive ? styles.active : null, fill ? styles.fill : null)}
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

export const Navigation = ({ fill = false, isFixed }: { fill?: boolean; isFixed?: boolean }) => {
  const extraStyles = isFixed
    ? {
        position: 'absolute' as any,
        top: 0,
        zIndex: 2,
      }
    : {};

  return (
    <Slab
      marginTop={0}
      display="flex"
      padding={majorScale(3)}
      justifyContent="space-around"
      alignItems="center"
      flexWrap="wrap"
      {...extraStyles}
    >
      <a href="/">
        <img
          src={logoWide}
          alt="ICOD logo"
          style={{ borderRadius: `${majorScale(3)}px` }}
          width="256"
          height="118"
        />
      </a>
      <Slab
        display="flex"
        flexWrap="wrap"
        justifyContent="space-around"
        marginBottom={majorScale(5)}
      >
        <NavLink
          fill={fill}
          href="/store"
        >
          Start
        </NavLink>
        <NavLink
          fill={fill}
          href="/secure"
        >
          Secure
        </NavLink>
        <NavLink
          fill={fill}
          href="/restore"
        >
          Restore
        </NavLink>
        <UserMenu fill={fill} />
      </Slab>
    </Slab>
  );
};

function UserMenu({ fill }: { fill: boolean }) {
  const { isLoading, me } = useUser();
  const isSlowLoading = useBufferedSynced({
    syncValue: isLoading,
    initialValue: false,
  });

  if (!me && !isLoading) {
    return (
      <NavLink
        fill={fill}
        href="/login"
      >
        Login
      </NavLink>
    );
  }

  if (isSlowLoading) {
    return (
      <NavLink
        fill={fill}
        href="."
      >
        <Spinner />
      </NavLink>
    );
  }

  return (
    <NavLink
      fill={fill}
      href="/dashboard"
    >
      Profile
    </NavLink>
  );
}
