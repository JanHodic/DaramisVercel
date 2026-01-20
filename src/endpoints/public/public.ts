// src/payload/endpoints/public.ts
import type { Endpoint, PayloadRequest } from 'payload'

/**
 * Nastav podle vašeho projektu (slugs kolekcí)
 */
const COLLECTIONS = {
  projects: 'projects',
  amenities: 'amenities',
  posts: 'posts',
  jobs: 'jobs',
  pages: 'pages',
} as const

const safeInt = (v: any, def: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

const getQuery = (req: PayloadRequest, key: string) => req.searchParams?.get(key) ?? undefined
const getRouteParam = (req: PayloadRequest, key: string) => (req.routeParams as any)?.[key] as string | undefined

const json = (body: any, status = 200, cacheSeconds = 60) => {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
  if (cacheSeconds > 0) {
    headers.set('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 10}`)
  }
  return new Response(JSON.stringify(body), { status, headers })
}

const errorJson = (status: number, message: string, extra?: any) =>
  json({ error: message, ...(extra ? { extra } : {}) }, status, 0)

const toPublicProject = (p: any) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  subtitle: p.subtitle,
  status: p.status,
  city: p.city,

  cover: p.cover,
  model3d: p.model3d,

  dashboard: p.dashboard,

  sections: p.sections,
  location: p.location,
  gallery: p.gallery,
  amenities: p.amenities,
  standards: p.standards,
  timeline: p.timeline,
  units: p.units,

  updatedAt: p.updatedAt,
})

export const publicHome: Endpoint = {
  path: '/public/home',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const locale = getQuery(req, 'locale')

      const featured = await req.payload.find({
        collection: COLLECTIONS.projects,
        where: { status: { equals: 'current' } },
        limit: 6,
        depth: 3,
        sort: '-updatedAt',
      })

      let latestPosts: any[] = []
      try {
        const posts = await req.payload.find({
          collection: COLLECTIONS.posts,
          limit: 6,
          depth: 2,
          sort: '-publishedAt',
        })
        latestPosts = posts.docs
      } catch {
        latestPosts = []
      }

      return json(
        {
          featuredProjects: featured.docs.map(toPublicProject),
          latestPosts,
          meta: { generatedAt: new Date().toISOString() },
        },
        200,
        120
      )
    } catch (e: any) {
      return errorJson(500, e?.message ?? 'Unknown error')
    }
  },
}

export const publicProjectsList: Endpoint = {
  path: '/public/projects',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const status = getQuery(req, 'status')
      const forSale = getQuery(req, 'forSale')
      const locale = getQuery(req, 'locale')

      const limit = Math.min(safeInt(getQuery(req, 'limit'), 24), 100)
      const page = Math.max(safeInt(getQuery(req, 'page'), 1), 1)
      const depth = Math.min(safeInt(getQuery(req, 'depth'), 2), 10)

      const where: any = {}
      if (status) where.status = { equals: status }
      if (forSale === 'true') where.forSale = { equals: true } // smaž pokud nemáš field

      const result = await req.payload.find({
        collection: COLLECTIONS.projects,
        where,
        limit,
        page,
        depth,
        sort: '-updatedAt',
      })

      return json(
        {
          docs: result.docs.map(toPublicProject),
          page: result.page,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
        200,
        120
      )
    } catch (e: any) {
      return errorJson(500, e?.message ?? 'Unknown error')
    }
  },
}

export const publicProjectDetail: Endpoint = {
  path: '/public/projects/:slug',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const slug = getRouteParam(req, 'slug')
      if (!slug) return errorJson(400, 'Missing slug')

      const locale = getQuery(req, 'locale')
      const depth = Math.min(safeInt(getQuery(req, 'depth'), 4), 10)

      const found = await req.payload.find({
        collection: COLLECTIONS.projects,
        where: { slug: { equals: slug } },
        limit: 1,
        depth,
      })

      const project = found.docs?.[0]
      if (!project) return errorJson(404, 'Project not found')

      return json({ project: toPublicProject(project) }, 200, 300)
    } catch (e: any) {
      return errorJson(500, e?.message ?? 'Unknown error')
    }
  },
}

export const publicBlogList: Endpoint = {
  path: '/public/blog',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const locale = getQuery(req, 'locale')
      const category = getQuery(req, 'category')

      const limit = Math.min(safeInt(getQuery(req, 'limit'), 12), 100)
      const page = Math.max(safeInt(getQuery(req, 'page'), 1), 1)

      const where: any = {}
      if (category) where.category = { equals: category }

      const result = await req.payload.find({
        collection: COLLECTIONS.posts,
        where,
        limit,
        page,
        depth: 2,
        sort: '-publishedAt',
      })

      return json(
        {
          docs: result.docs,
          page: result.page,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
        },
        200,
        120
      )
    } catch (e: any) {
      return errorJson(500, 'Blog collection not available (check COLLECTIONS.posts)', { message: e?.message })
    }
  },
}

export const publicBlogDetail: Endpoint = {
  path: '/public/blog/:slug',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const slug = getRouteParam(req, 'slug')
      if (!slug) return errorJson(400, 'Missing slug')

      const locale = getQuery(req, 'locale')

      const found = await req.payload.find({
        collection: COLLECTIONS.posts,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 4,
      })

      const post = found.docs?.[0]
      if (!post) return errorJson(404, 'Post not found')

      return json({ post }, 200, 300)
    } catch (e: any) {
      return errorJson(500, 'Blog collection not available (check COLLECTIONS.posts)', { message: e?.message })
    }
  },
}

export const publicJobsList: Endpoint = {
  path: '/public/jobs',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const locale = getQuery(req, 'locale')
      const limit = Math.min(safeInt(getQuery(req, 'limit'), 50), 100)

      const result = await req.payload.find({
        collection: COLLECTIONS.jobs,
        limit,
        depth: 2,
        sort: '-updatedAt',
      })

      return json({ docs: result.docs }, 200, 300)
    } catch (e: any) {
      return errorJson(500, 'Jobs collection not available (check COLLECTIONS.jobs)', { message: e?.message })
    }
  },
}

export const publicJobsDetail: Endpoint = {
  path: '/public/jobs/:slug',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const slug = getRouteParam(req, 'slug')
      if (!slug) return errorJson(400, 'Missing slug')

      const locale = getQuery(req, 'locale')

      const found = await req.payload.find({
        collection: COLLECTIONS.jobs,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 4,
      })

      const job = found.docs?.[0]
      if (!job) return errorJson(404, 'Job not found')

      return json({ job }, 200, 600)
    } catch (e: any) {
      return errorJson(500, 'Jobs collection not available (check COLLECTIONS.jobs)', { message: e?.message })
    }
  },
}

export const publicPageBySlug: Endpoint = {
  path: '/public/pages/:slug',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const slug = getRouteParam(req, 'slug')
      if (!slug) return errorJson(400, 'Missing slug')

      const locale = getQuery(req, 'locale')

      const found = await req.payload.find({
        collection: COLLECTIONS.pages,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 4,
      })

      const page = found.docs?.[0]
      if (!page) return errorJson(404, 'Page not found')

      return json({ page }, 200, 600)
    } catch (e: any) {
      return errorJson(500, 'Pages collection not available (check COLLECTIONS.pages)', { message: e?.message })
    }
  },
}

export const publicNewsletter: Endpoint = {
  path: '/public/newsletter',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    try {
      const email = (req.body as any)?.email.trim()
      if (!email) return errorJson(400, 'Missing email')

      // TODO:
      // await req.payload.create({ collection: 'newsletterSignups', data: { email } })

      return json({ ok: true }, 200, 0)
    } catch (e: any) {
      return errorJson(500, e?.message ?? 'Unknown error')
    }
  },
}

export const publicRoutes: Endpoint = {
  path: '/public/routes',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    try {
      const locale = getQuery(req, 'locale')

      const projects = await req.payload.find({
        collection: COLLECTIONS.projects,
        limit: 1000,
        depth: 0,
      })

      let posts: any[] = []
      try {
        const p = await req.payload.find({
          collection: COLLECTIONS.posts,
          limit: 2000,
          depth: 0,
        })
        posts = p.docs
      } catch {
        posts = []
      }

      return json(
        {
          projects: projects.docs.map((d: any) => ({ slug: d.slug, updatedAt: d.updatedAt })),
          posts: posts.map((d: any) => ({ slug: d.slug, updatedAt: d.updatedAt })),
        },
        200,
        600
      )
    } catch (e: any) {
      return errorJson(500, e?.message ?? 'Unknown error')
    }
  },
}

export const publicEndpoints: Endpoint[] = [
  publicHome,
  publicProjectsList,
  publicProjectDetail,
  publicBlogList,
  publicBlogDetail,
  publicJobsList,
  publicJobsDetail,
  publicPageBySlug,
  publicNewsletter,
  publicRoutes,
]