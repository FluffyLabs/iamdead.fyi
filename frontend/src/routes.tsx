import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Editor } from './pages/editor';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';

export function Routes() {
  return (
    <>
      <ReactRoutes>
        <Route index element={<Home />} />
        <Route element={<Editor />} path="editor" />
        <Route element={<Login />} path="login">
          <Route index element={<IndieAuthForm />} path="indie-auth" />
          <Route element={<IndieAuthRedirect />} path="indie-auth-redirect" />
        </Route>
      </ReactRoutes>
      <Outlet />
    </>
  );
}
