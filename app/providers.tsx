"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, type ReactNode } from "react";

const ONE_DAY = 1000 * 60 * 60 * 24;

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 30, // 30 min — treat data as fresh, no refetch
            gcTime: ONE_DAY * 7, // keep in memory a week
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  const [persister] = useState(() =>
    typeof window === "undefined"
      ? null
      : createSyncStoragePersister({
          storage: window.localStorage,
          key: "mangahub.query-cache.v1",
          throttleTime: 1000,
        })
  );

  if (!persister) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: ONE_DAY * 7,
        buster: "v2",
        dehydrateOptions: {
          // Only persist successful queries with a defined shape
          shouldDehydrateQuery: (q) => q.state.status === "success" && q.state.data !== undefined,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}