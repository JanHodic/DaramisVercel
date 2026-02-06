/* eslint-disable */
/**
 * Custom Public API client (generated from src/payload/endpoints/public.ts)
 *
 * By default, this client assumes your Payload REST API is served under `/api`,
 * so `/public/home` becomes `/api/public/home`.
 */

import type { Project } from "../lib/types";

// ---- Payload helpers

export type PayloadListResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages?: number;
};

export function projectToQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

/**
 * ✅ DŮLEŽITÉ:
 * - V prohlížeči VŽDY používej same-origin `/api` (jinak CORS na preview/prod doménách)
 * - Env můžeš použít jen server-side, nebo pokud je to také same-origin
 */
export function getApiBase(): string {
  // Browser: vždy same-origin
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server: můžeš mít absolutní base (např. pro SSR), ale default je pořád /api
  const base = process.env.NEXT_PUBLIC_PAYLOAD_API_BASE ?? "/api";
  return String(base).replace(/\/$/, "");
}

export async function fetchProjects(locale: "cs" | "en", signal?: AbortSignal): Promise<Project[]> {
  const qs = projectToQuery({
    locale,
    depth: 0,
    limit: 200,
    "where[status][equals]": "current",
  });

  const url = `${getApiBase()}/projects?${qs}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Failed to fetch projects", res.status, url, txt);
    return [];
  }

  const data = (await res.json()) as PayloadListResponse<Project>;
  return Array.isArray(data?.docs) ? data.docs : [];
}

export async function fetchAllProjects(locale: "cs" | "en", signal?: AbortSignal): Promise<Project[]> {
  const qs = projectToQuery({
    locale,
    depth: 0,
    limit: 200,
  });

  const url = `${getApiBase()}/projects?${qs}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Failed to fetch projects", res.status, url, txt);
    return [];
  }

  const data = (await res.json()) as PayloadListResponse<Project>;
  return Array.isArray(data?.docs) ? data.docs : [];
}

export function findProject(projects: Project[], idOrSlug: string | null): Project | null {
  if (!idOrSlug) return null;

  const key = String(idOrSlug);

  const byId = projects.find((p) => String((p as any).id) === key);
  if (byId) return byId;

  const bySlug = projects.find((p) => String((p as any).slug) === key);
  return bySlug ?? null;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ApiClientParams = {
  /** Example: https://example.com */
  baseUrl?: string;
  token?: string;
  defaultHeaders?: Record<string, string>;
  apiPrefix?: string;
};

export class ApiClient {
  private baseUrl: string;
  private token?: string;
  private defaultHeaders: Record<string, string>;
  private apiPrefix: string;

  constructor(params?: ApiClientParams) {
    this.baseUrl = params?.baseUrl ?? "";
    this.token = params?.token;
    this.defaultHeaders = params?.defaultHeaders ?? {};
    this.apiPrefix = (params?.apiPrefix ?? "/api").replace(/\/$/, "");
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token?: string) {
    this.token = token;
  }

  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = headers;
  }

  setApiPrefix(apiPrefix: string) {
    this.apiPrefix = apiPrefix.replace(/\/$/, "");
  }

  async request<TResponse = unknown, TBody = unknown>(
    method: HttpMethod,
    path: string,
    params?: { query?: Record<string, any>; body?: TBody },
    opts?: RequestOptions,
  ): Promise<TResponse> {
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    const prefix = this.apiPrefix ? this.apiPrefix : "";

    // ✅ Klíčová věc: pokud baseUrl není zadané, jedeme same-origin
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL(`${prefix}${fullPath}`, this.baseUrl || origin);

    const query = params?.query ?? {};
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, String(vv)));
      else url.searchParams.set(k, String(v));
    });

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(opts?.headers ?? {}),
    };

    if (this.token) {
      headers["Authorization"] = this.token.startsWith("Bearer ") ? this.token : `Bearer ${this.token}`;
    }

    let body: BodyInit | undefined;
    if (params?.body !== undefined) {
      if (typeof FormData !== "undefined" && params.body instanceof FormData) {
        body = params.body as any;
      } else {
        headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
        body = headers["Content-Type"].includes("application/json")
          ? JSON.stringify(params.body)
          : (params.body as any);
      }
    }

    const res = await fetch(url.toString(), { method, headers, body, signal: opts?.signal, credentials: "include" });
    const text = await res.text();
    const isJson = res.headers.get("content-type")?.includes("application/json");

    if (!res.ok) {
      const payload = isJson && text ? safeJson(text) : text;
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
    }

    return (isJson && text ? safeJson(text) : (text as any)) as TResponse;
  }

  // ---------------------------
  // Public endpoints
  // ---------------------------

  publicHome(query?: { locale?: string }, opts?: RequestOptions) {
    return this.request<PublicHomeResponse>("GET", "/public/home", { query }, opts);
  }

  publicProjects(
    query?: { status?: string; forSale?: "true" | "false"; locale?: string; limit?: number; page?: number; depth?: number },
    opts?: RequestOptions,
  ) {
    return this.request<PublicProjectsListResponse>("GET", "/public/projects", { query }, opts);
  }

  publicProjectBySlug(slug: string, query?: { locale?: string; depth?: number }, opts?: RequestOptions) {
    return this.request<PublicProjectDetailResponse>("GET", `/public/projects/${encodeURIComponent(slug)}`, { query }, opts);
  }

  publicBlog(query?: { locale?: string; category?: string; limit?: number; page?: number }, opts?: RequestOptions) {
    return this.request<PublicBlogListResponse>("GET", "/public/blog", { query }, opts);
  }

  publicBlogBySlug(slug: string, query?: { locale?: string }, opts?: RequestOptions) {
    return this.request<PublicBlogDetailResponse>("GET", `/public/blog/${encodeURIComponent(slug)}`, { query }, opts);
  }

  publicJobs(query?: { locale?: string; limit?: number }, opts?: RequestOptions) {
    return this.request<PublicJobsListResponse>("GET", "/public/jobs", { query }, opts);
  }

  publicJobBySlug(slug: string, query?: { locale?: string }, opts?: RequestOptions) {
    return this.request<PublicJobsDetailResponse>("GET", `/public/jobs/${encodeURIComponent(slug)}`, { query }, opts);
  }

  publicPageBySlug(slug: string, query?: { locale?: string }, opts?: RequestOptions) {
    return this.request<PublicPageBySlugResponse>("GET", `/public/pages/${encodeURIComponent(slug)}`, { query }, opts);
  }

  publicNewsletter(body: { email: string }, opts?: RequestOptions) {
    return this.request<PublicNewsletterResponse, { email: string }>("POST", "/public/newsletter", { body }, opts);
  }

  publicRoutes(query?: { locale?: string }, opts?: RequestOptions) {
    return this.request<PublicRoutesResponse>("GET", "/public/routes", { query }, opts);
  }
}

// ---------------------------
// Response types
// ---------------------------

export type PublicError = { error: string; extra?: any };

export type PublicProject = {
  id: string;
  slug?: string;
  title?: any;
  subtitle?: any;
  status?: any;
  city?: any;
  cover?: any;
  model3d?: any;
  dashboard?: any;
  sections?: any;
  location?: any;
  gallery?: any;
  amenities?: any;
  standards?: any;
  timeline?: any;
  units?: any;
  updatedAt?: string;
};

export type PublicHomeResponse =
  | { featuredProjects: PublicProject[]; latestPosts: any[]; meta: { generatedAt: string } }
  | PublicError;

export type PublicProjectsListResponse =
  | { docs: PublicProject[]; page: number; totalPages: number; totalDocs: number; hasNextPage: boolean; hasPrevPage: boolean }
  | PublicError;

export type PublicProjectDetailResponse = { project: PublicProject } | PublicError;

export type PublicBlogListResponse =
  | { docs: any[]; page: number; totalPages: number; totalDocs: number }
  | PublicError;

export type PublicBlogDetailResponse = { post: any } | PublicError;

export type PublicJobsListResponse = { docs: any[] } | PublicError;

export type PublicJobsDetailResponse = { job: any } | PublicError;

export type PublicPageBySlugResponse = { page: any } | PublicError;

export type PublicNewsletterResponse = { ok: true } | PublicError;

export type PublicRoutesResponse =
  | { projects: { slug: string; updatedAt: string }[]; posts: { slug: string; updatedAt: string }[] }
  | PublicError;

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}