import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Editor } from './pages/editor';
import { Home } from './pages/home';
import { Recover } from './pages/recover';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Wizzard } from './pages/wizzard';
import { Security } from './pages/wizzard/security';
import { ProofOfLife } from './pages/wizzard/proof-of-life';
import { Steps } from './pages/wizzard/consts';
import { Message } from './pages/wizzard/message';

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

        <Route element={<Wizzard />} path="wizzard">
          <Route index element={<Security />} path={Steps.Security} />
          <Route element={<ProofOfLife />} path={Steps.ProofOfLife} />
          <Route element={<Message />} path={Steps.Message} />
        </Route>
      </ReactRoutes>
      <Outlet />
    </>
  );
}
