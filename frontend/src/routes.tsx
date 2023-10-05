import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Home } from './pages/home';
import { Recover } from './pages/recover';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Wizard } from './pages/oldwizard';
import { Security } from './pages/oldwizard/security';
import { ProofOfLife } from './pages/oldwizard/proof-of-life';
import { Steps } from './pages/oldwizard/consts';
import { Message } from './pages/oldwizard/message';
import { Secure } from './pages/secure';

export function Routes() {
  return (
    <>
      <ReactRoutes>
        <Route index element={<Home />} />

        <Route element={<Secure />} path="secure" />
        <Route element={<Recover />} path="recover" />

        <Route element={<Login />} path="login">
          <Route index element={<IndieAuthForm />} path="indie-auth" />
          <Route element={<IndieAuthRedirect />} path="indie-auth-redirect" />
        </Route>

        <Route element={<Wizard />} path="oldwizard">
          <Route index element={<Security />} path={Steps.Security} />
          <Route element={<ProofOfLife />} path={Steps.ProofOfLife} />
          <Route element={<Message />} path={Steps.Message} />
        </Route>
      </ReactRoutes>
      <Outlet />
    </>
  );
}
