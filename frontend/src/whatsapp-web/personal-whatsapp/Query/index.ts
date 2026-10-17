import { QueryClient } from '@tanstack/react-query';

export const personalWhatsappQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
