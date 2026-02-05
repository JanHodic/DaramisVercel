import { createDaramisApiClient } from "./api.client";

export const api = createDaramisApiClient({
  // baseUrl NECH prázdné / undefined => same-origin
  baseUrl: undefined,
  defaultQuery: { locale: "cs", depth: 1 },
  getToken: () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
});
