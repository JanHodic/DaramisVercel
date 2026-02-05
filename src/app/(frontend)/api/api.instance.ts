import { createDaramisApiClient } from "./api.client";

export const api = createDaramisApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://daramis-vercel.vercel.app',
  getToken: () => localStorage.getItem('token'),
  defaultQuery: { locale: 'cs', depth: 2 },
})

