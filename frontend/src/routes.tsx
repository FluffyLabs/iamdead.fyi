import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Home } from './pages/home';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Secure } from './pages/secure';
import { Store } from './pages/store';
import { Scan } from './pages/scan';

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
          element={<Scan />}
          path="scan"
        />
        <Route
          element={<Scan />}
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
