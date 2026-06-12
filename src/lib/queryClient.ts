import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../infrastructure/api/api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.code === "INVALID_RESPONSE" || error.code === "ABORTED") {
            return false;
          }
        }

        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
