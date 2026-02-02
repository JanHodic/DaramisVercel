"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClient } from "./apiClient.public";

const ApiContext = createContext<{ publicApi: ApiClient } | null>(null);

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside <ApiProvider />");
  return ctx;
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function ApiProvider({
  children,
  baseUrl,
  apiPrefix = "/api",
}: {
  children: React.ReactNode;
  baseUrl?: string;
  apiPrefix?: string;
}) {
  const [queryClient] = useState(() => createClient());

  const publicApi = useMemo(() => new ApiClient({ baseUrl, apiPrefix }), [baseUrl, apiPrefix]);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ publicApi }}>{children}</ApiContext.Provider>
    </QueryClientProvider>
  );
}
