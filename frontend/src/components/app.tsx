import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Routes } from '../routes';
import { EvergreenTheme } from './evergreen-theme';

const queryClient = new QueryClient();

export function App() {
  return (
    <EvergreenTheme>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <Routes />
        </QueryClientProvider>
      </HashRouter>
    </EvergreenTheme>
  );
}
