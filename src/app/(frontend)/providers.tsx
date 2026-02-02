"use client";

import { ApiProvider } from "./api/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider baseUrl={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}>
      {children}
    </ApiProvider>
  );
}