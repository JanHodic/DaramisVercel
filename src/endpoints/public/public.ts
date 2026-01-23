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

export const publicEndpoints: Endpoint[] = [
  publicProjectsList,
  publicProjectDetail,
  publicNewsletter,
]