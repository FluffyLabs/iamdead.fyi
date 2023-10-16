import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Home } from './pages/home';
import { Recover } from './pages/recover';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Secure } from './pages/secure';
import { Store } from './pages/store';

export function Routes() {
  return (
    <>
      <ReactRoutes>
        <Route
          index
          element={<Home />}
        />

        <Route
          element={<Secure />}
          path="secure"
        />
        <Route
          element={<Store />}
          path="store"
        />
        <Route
          element={<Recover />}
          path="recover"
        />

        <Route
          element={<Login />}
          path="login"
        >
          <Route
            index
            element={<IndieAuthForm />}
            path="indie-auth"
          />
          <Route
            element={<IndieAuthRedirect />}
            path="indie-auth-redirect"
          />
        </Route>
      </ReactRoutes>
      <Outlet />
    </>
  );
}
