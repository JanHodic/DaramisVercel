import { createDaramisApiClient } from "./api.client";

export const api = createDaramisApiClient({
  // ✅ same-origin (calls /api/... on the same domain)
  baseUrl: "",
  defaultQuery: { locale: "cs", depth: 2 },
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
});