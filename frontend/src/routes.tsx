import { Routes as ReactRoutes, Route, Outlet } from 'react-router-dom';

import { Home } from "./pages/home"
import { Login } from "./pages/login"

export function Routes() {
    return (
        <>
            <ReactRoutes>
                <Route index element={<Home />} />
                <Route element={<Login />} path="login" />
            </ReactRoutes>
            <Outlet />
        </>
    )
}