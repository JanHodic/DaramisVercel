import { Media } from "./api/api.client";


export function resolvePayloadUrl(
  value?: string | Media | null,
  baseUrl?: string
): string | null {
  if (!value) return null;

  const url =
    typeof value === "string"
      ? value
      : value.url ?? value.sizes?.large?.url ?? value.sizes?.medium?.url ?? value.sizes?.thumbnail?.url ?? null;

  if (!url) return null;

  // už je absolutní
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const origin = baseUrl || process.env.NEXT_PUBLIC_API_URL || "https://daramis-vercel.vercel.app";
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}