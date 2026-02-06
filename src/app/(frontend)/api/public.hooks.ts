import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  PublicBlogDetailResponse,
  PublicBlogListResponse,
  PublicHomeResponse,
  PublicJobsDetailResponse,
  PublicJobsListResponse,
  PublicNewsletterResponse,
  PublicPageBySlugResponse,
  PublicProjectDetailResponse,
  PublicProjectsListResponse,
  PublicRoutesResponse,
} from "./apiClient.public";
import { useApi } from "./queryClient";
import { publicKeys } from "./public.keys";

export function usePublicHome(query?: { locale?: string }) {
  const { publicApi } = useApi();
  return useQuery<PublicHomeResponse>({
    queryKey: publicKeys.home(query),
    queryFn: () => publicApi.publicHome(query),
  });
}

export function usePublicProjects(query?: {
  status?: string;
  forSale?: "true" | "false";
  locale?: string;
  limit?: number;
  page?: number;
  depth?: number;
}) {
  const { publicApi } = useApi();
  return useQuery<PublicProjectsListResponse>({
    queryKey: publicKeys.projects(query),
    queryFn: () => publicApi.publicProjects(query),
  });
}

export function usePublicProjectBySlug(slug: string | undefined, query?: { locale?: string; depth?: number }) {
  const { publicApi } = useApi();
  return useQuery<PublicProjectDetailResponse>({
    queryKey: slug ? publicKeys.project(slug, query) : publicKeys.project("__missing__", query),
    queryFn: () => publicApi.publicProjectBySlug(slug as string, query),
    enabled: Boolean(slug),
  });
}

export function usePublicBlog(query?: { locale?: string; category?: string; limit?: number; page?: number }) {
  const { publicApi } = useApi();
  return useQuery<PublicBlogListResponse>({
    queryKey: publicKeys.blog(query),
    queryFn: () => publicApi.publicBlog(query),
  });
}

export function usePublicBlogPostBySlug(slug: string | undefined, query?: { locale?: string }) {
  const { publicApi } = useApi();
  return useQuery<PublicBlogDetailResponse>({
    queryKey: slug ? publicKeys.post(slug, query) : publicKeys.post("__missing__", query),
    queryFn: () => publicApi.publicBlogBySlug(slug as string, query),
    enabled: Boolean(slug),
  });
}

export function usePublicJobs(query?: { locale?: string; limit?: number }) {
  const { publicApi } = useApi();
  return useQuery<PublicJobsListResponse>({
    queryKey: publicKeys.jobs(query),
    queryFn: () => publicApi.publicJobs(query),
  });
}

export function usePublicJobBySlug(slug: string | undefined, query?: { locale?: string }) {
  const { publicApi } = useApi();
  return useQuery<PublicJobsDetailResponse>({
    queryKey: slug ? publicKeys.job(slug, query) : publicKeys.job("__missing__", query),
    queryFn: () => publicApi.publicJobBySlug(slug as string, query),
    enabled: Boolean(slug),
  });
}

export function usePublicPageBySlug(slug: string | undefined, query?: { locale?: string }) {
  const { publicApi } = useApi();
  return useQuery<PublicPageBySlugResponse>({
    queryKey: slug ? publicKeys.page(slug, query) : publicKeys.page("__missing__", query),
    queryFn: () => publicApi.publicPageBySlug(slug as string, query),
    enabled: Boolean(slug),
  });
}

export function usePublicRoutes(query?: { locale?: string }) {
  const { publicApi } = useApi();
  return useQuery<PublicRoutesResponse>({
    queryKey: publicKeys.routes(query),
    queryFn: () => publicApi.publicRoutes(query),
  });
}

export function useNewsletterSignup() {
  const { publicApi } = useApi();
  return useMutation<PublicNewsletterResponse, Error, { email: string }>({
    mutationFn: (body) => publicApi.publicNewsletter(body),
  });
}