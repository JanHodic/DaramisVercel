export const publicKeys = {
  all: ['public'] as const,

  home: (query?: { locale?: string }) => [...publicKeys.all, 'home', query ?? {}] as const,

  projects: (query?: {
    status?: string
    forSale?: 'true' | 'false'
    locale?: string
    limit?: number
    page?: number
    depth?: number
  }) => [...publicKeys.all, 'projects', query ?? {}] as const,

  project: (slug: string, query?: { locale?: string; depth?: number }) =>
    [...publicKeys.all, 'project', slug, query ?? {}] as const,

  blog: (query?: { locale?: string; category?: string; limit?: number; page?: number }) =>
    [...publicKeys.all, 'blog', query ?? {}] as const,

  post: (slug: string, query?: { locale?: string }) => [...publicKeys.all, 'post', slug, query ?? {}] as const,

  jobs: (query?: { locale?: string; limit?: number }) => [...publicKeys.all, 'jobs', query ?? {}] as const,

  job: (slug: string, query?: { locale?: string }) => [...publicKeys.all, 'job', slug, query ?? {}] as const,

  page: (slug: string, query?: { locale?: string }) => [...publicKeys.all, 'page', slug, query ?? {}] as const,

  routes: (query?: { locale?: string }) => [...publicKeys.all, 'routes', query ?? {}] as const,
}