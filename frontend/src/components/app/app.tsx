import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Routes } from "../../routes";

const queryClient = new QueryClient();

export function App() {
  return (
   <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes />
      </QueryClientProvider>
   </BrowserRouter>
  );
}