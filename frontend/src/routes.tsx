import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Editor } from './pages/editor';
import { Home } from './pages/home';
import { Recover } from './pages/recover';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Wizard } from './pages/wizard';
import { Security } from './pages/wizard/security';
import { ProofOfLife } from './pages/wizard/proof-of-life';
import { Steps } from './pages/wizard/consts';
import { Message } from './pages/wizard/message';

export function Routes() {
  return (
    <>
      <ReactRoutes>
        <Route index element={<Home />} />
        <Route element={<Editor />} path="editor" />
        <Route element={<Recover />} path="recover" />

        <Route element={<Login />} path="login">
          <Route index element={<IndieAuthForm />} path="indie-auth" />
          <Route element={<IndieAuthRedirect />} path="indie-auth-redirect" />
        </Route>

        <Route element={<Wizard />} path="wizard">
          <Route index element={<Security />} path={Steps.Security} />
          <Route element={<ProofOfLife />} path={Steps.ProofOfLife} />
          <Route element={<Message />} path={Steps.Message} />
        </Route>
      </ReactRoutes>
      <Outlet />
    </>
  );
}
