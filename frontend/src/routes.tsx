import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Home } from './pages/home';
import { Login } from './pages/login';
import { IndieAuthForm, IndieAuthRedirect } from './pages/login/indie-auth';
import { Secure } from './pages/secure';
import { Store, StoreIntro } from './pages/store';
import { Scan } from './pages/scan';
import { NotFound } from './pages/not-found';
import { Dashboard } from './pages/dashboard';
import { Dev } from './pages/dev';

export function Routes() {
  return (
    <>
      <ReactRoutes>
        <Route
          path="*"
          element={<NotFound />}
        />
        <Route
          path="dev"
          element={<Dev />}
        />
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
          element={<StoreIntro />}
          path="store/intro"
        />
        <Route
          element={<Scan />}
          path="scan"
        />
        <Route
          element={<Scan />}
          path="restore"
        />
        <Route
          element={<Dashboard />}
          path="/dashboard"
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
