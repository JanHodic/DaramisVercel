/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Daramis API client (Payload REST style)
 * Base URL: https://daramis-vercel.vercel.app
 *
 * - Supports public & authenticated endpoints
 * - Handles Payload-style "where" (deepObject) query encoding
 * - Strong-ish typing for main entities & list responses from OpenAPI snippet
 */

export const DEFAULT_BASE_URL = 'https://daramis-vercel.vercel.app'

/** -----------------------------
 * Types (from your OpenAPI)
 * ---------------------------- */

export type ID = string

export type PayloadListResponse<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export type NewDocResponse<T> = {
  message: string
  doc: T & { id: string; createdAt: string; updatedAt: string }
}

export type UserRole = 'viewer' | 'editor' | 'superadmin'

export type Media = {
  id: string
  title: string
  external?: {
    realpad?: {
      uid?: string | null
      type?: 'pdf' | 'plan' | 'image' | 'other' | null
    }
  }
  prefix?: string | null
  folder?: string | Folder | null
  updatedAt: string
  createdAt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  sizes?: {
    thumbnail?: MediaSize
    square?: MediaSize
    small?: MediaSize
    medium?: MediaSize
    large?: MediaSize
    xlarge?: MediaSize
    og?: MediaSize
  }
}

export type MediaSize = {
  url?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  filesize?: number | null
  filename?: string | null
}

export type UserSession = {
  id: string
  createdAt?: string | null
  expiresAt: string
}

export type User = {
  id: string
  role: UserRole
  fullName?: string | null
  updatedAt: string
  createdAt: string
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  sessions?: UserSession[] | null
  password?: string | null
}

export type ProjectStatus = 'planned' | 'current' | 'finished'
export type ProjectHeroType = 'image' | 'video' | 'youtube'

export type ProjectSection =
  | 'location'
  | 'gallery'
  | 'standards'
  | 'timeline'
  | 'units'
  | 'model3d'
  | 'amenities'

export type POICategory =
  | 'school'
  | 'shop'
  | 'park'
  | 'transport'
  | 'restaurant'
  | 'pharmacy'
  | 'hospital'
  | 'sport'

export type Project = {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  city?: string | null
  status: ProjectStatus
  logo?: string | Media | null
  sections?: ProjectSection[] | null
  heroType: ProjectHeroType
  cover?: string | Media | null
  heroVideo?: string | Media | null
  heroYouTubeUrl?: string | null

  locationTab?: {
    centerLat: number
    centerLng: number
    defaultZoom?: number | null
    pointsOfInterests?: Array<{
      name: string
      category: POICategory
      lat: number
      lng: number
      distanceText?: string | null
      description?: string | null
      id?: string | null
    }> | null
  }

  galleryTab?: {
    gallery?: Array<string | Media> | null
  }

  standardsTab?: {
    standards?: Array<string | Media> | null
  }

  timelineTab?: {
    timelineItems?: Array<{
      title: string
      description?: string | null
      id?: string | null
    }> | null
  }

  unitsTab?: {
    realpad?: {
      enabled?: boolean | null
      baseUrl?: string | null
      login?: string | null
      password?: string | null
      screenId?: number | null
      projectId?: string | null
      developerId?: number | null
      syncFrequencyMinutes?: number | null
      lastSyncAt?: string | null
      lastSyncStatus?: 'ok' | 'error' | 'skipped' | null
      lastSyncError?: string | null
    }
  }

  model3dTab?: {
    model3d?: string | Media | null
  }

  amenitiesTab?: {
    amenities?: Array<{
      title: string
      image?: string | Media | null
      description?: string | null
      id?: string | null
    }> | null
  }

  updatedAt: string
  createdAt: string
}

export type Post = {
  id: string
  title: string
  slug: string
  content?: string | null
  updatedAt: string
  createdAt: string
}

export type Page = {
  id: string
  title: string
  slug: string
  content?: string | null
  updatedAt: string
  createdAt: string
}

export type PayloadKv = {
  id: string
  key: string
  data: any
}

export type Folder = {
  id: string
  name: string
  folder?: string | Folder | null
  documentsAndFolders?: {
    docs?: Array<
      | {
          relationTo: 'payload-folders'
          value: string | Folder
        }
      | {
          relationTo: 'media'
          value: string | Media
        }
    >
    hasNextPage?: boolean
    totalDocs?: number
  }
  folderType?: Array<'media'> | null
  updatedAt: string
  createdAt: string
}

export type PayloadLockedDocument = {
  id: string
  document?:
    | { relationTo: 'media'; value: string | Media }
    | { relationTo: 'users'; value: string | User }
    | { relationTo: 'projects'; value: string | Project }
    | { relationTo: 'post'; value: string | Post }
    | { relationTo: 'page'; value: string | Page }
    | { relationTo: 'payload-folders'; value: string | Folder }
    | null
  globalSlug?: string | null
  user: { relationTo: 'users'; value: string | User }
  updatedAt: string
  createdAt: string
}

export type PayloadPreference = {
  id: string
  user: { relationTo: 'users'; value: string | User }
  key?: string | null
  value: any
  updatedAt: string
  createdAt: string
}

export type PayloadMigration = {
  id: string
  name?: string | null
  batch?: number | null
  updatedAt: string
  createdAt: string
}

/** -----------------------------
 * Query helpers
 * ---------------------------- */

export type CommonListParams = {
  page?: number
  limit?: number
  depth?: number
  locale?: string
  'fallback-locale'?: string
  sort?: string
  where?: Record<string, any>
}

export type CommonDocParams = {
  depth?: number
  locale?: string
  'fallback-locale'?: string
}

/**
 * Encodes object into querystring.
 * Supports Payload deepObject for `where` using bracket notation:
 *   where[title][equals]=abc
 *   where[and][0][title][contains]=foo
 */
function toQueryString(params: Record<string, any> | undefined): string {
  if (!params) return ''
  const search = new URLSearchParams()

  const append = (key: string, value: any) => {
    if (value === undefined) return
    if (value === null) return
    search.append(key, String(value))
  }

  const walk = (prefix: string, value: any) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(`${prefix}[${i}]`, v))
      return
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => walk(`${prefix}[${k}]`, v))
      return
    }
    append(prefix, value)
  }

  Object.entries(params).forEach(([k, v]) => {
    if (k === 'where' && v && typeof v === 'object') {
      walk('where', v)
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      // for future deep objects (if needed)
      walk(k, v)
    } else if (Array.isArray(v)) {
      v.forEach((item) => append(k, item))
    } else {
      append(k, v)
    }
  })

  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/** -----------------------------
 * Errors + core client
 * ---------------------------- */

export class ApiError extends Error {
  status: number
  payload?: any
  constructor(message: string, status: number, payload?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export type ApiClientOptions = {
  baseUrl?: string
  /** For authenticated endpoints (Payload auth / token-based). */
  getToken?: () => string | undefined | null
  /** Default query params applied to every request (e.g. { locale: 'cs', depth: 1 }) */
  defaultQuery?: Record<string, any>
  /** Hook for request customization */
  onRequest?: (init: RequestInit) => RequestInit
}

export class DaramisApiClient {
  private baseUrl: string
  private getToken?: () => string | undefined | null
  private defaultQuery?: Record<string, any>
  private onRequest?: (init: RequestInit) => RequestInit

  constructor(opts: ApiClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL
    this.getToken = opts.getToken
    this.defaultQuery = opts.defaultQuery
    this.onRequest = opts.onRequest
  }

  private buildUrl(path: string, query?: Record<string, any>) {
    const mergedQuery = { ...(this.defaultQuery ?? {}), ...(query ?? {}) }
    return `${this.baseUrl}${path}${toQueryString(mergedQuery)}`
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    opts: {
      query?: Record<string, any>
      body?: any
      /** true => adds Authorization header if token exists */
      auth?: boolean
      headers?: Record<string, string>
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, opts.query)
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(opts.headers ?? {}),
    }

    const isJsonBody =
      opts.body !== undefined &&
      opts.body !== null &&
      !(opts.body instanceof FormData) &&
      typeof opts.body === 'object'

    if (isJsonBody) headers['Content-Type'] = 'application/json'

    if (opts.auth) {
      const token = this.getToken?.()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    let init: RequestInit = {
      method,
      headers,
      credentials: 'include', // helpful if Payload uses cookies; safe for same-origin-ish setups
      body:
        opts.body === undefined || opts.body === null
          ? undefined
          : opts.body instanceof FormData
            ? opts.body
            : isJsonBody
              ? JSON.stringify(opts.body)
              : String(opts.body),
    }

    if (this.onRequest) init = this.onRequest(init)

    const res = await fetch(url, init)

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')

    const data = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined)

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        `Request failed: ${method} ${path} (${res.status})`
      throw new ApiError(msg, res.status, data)
    }

    return data as T
  }

  /** -----------------------------
   * Media
   * ---------------------------- */

  listMedia(params?: CommonListParams) {
    return this.request<PayloadListResponse<Media>>('GET', '/api/media', { query: params })
  }

  createMedia(body: Partial<Media> & { title: string }, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<Media>>('POST', '/api/media', { body, query: params, auth: true })
  }

  findMediaById(id: ID, params?: CommonDocParams) {
    return this.request<Media>('GET', `/api/media/${encodeURIComponent(id)}`, { query: params })
  }

  updateMedia(id: ID, body: Partial<Media>, params?: CommonDocParams) {
    return this.request<Media>('PATCH', `/api/media/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deleteMedia(id: ID, params?: CommonDocParams) {
    return this.request<Media>('DELETE', `/api/media/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Users
   * ---------------------------- */

  listUsers(params?: CommonListParams) {
    return this.request<PayloadListResponse<User>>('GET', '/api/users', { query: params, auth: true })
  }

  createUser(body: Partial<User> & { role: UserRole; email: string }, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<User>>('POST', '/api/users', { body, query: params, auth: true })
  }

  findUserById(id: ID, params?: CommonDocParams) {
    return this.request<User>('GET', `/api/users/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  updateUser(id: ID, body: Partial<User>, params?: CommonDocParams) {
    return this.request<User>('PATCH', `/api/users/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deleteUser(id: ID, params?: CommonDocParams) {
    return this.request<User>('DELETE', `/api/users/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Projects
   * ---------------------------- */

  listProjects(params?: CommonListParams) {
    return this.request<PayloadListResponse<Project>>('GET', '/api/projects', { query: params })
  }

  createProject(
    body: Pick<Project, 'title' | 'slug' | 'status' | 'heroType'> & Partial<Project>,
    params?: Pick<CommonDocParams, 'depth' | 'locale'>,
  ) {
    return this.request<NewDocResponse<Project>>('POST', '/api/projects', { body, query: params, auth: true })
  }

  findProjectById(id: ID, params?: CommonDocParams) {
    return this.request<Project>('GET', `/api/projects/${encodeURIComponent(id)}`, { query: params })
  }

  updateProject(id: ID, body: Partial<Project>, params?: CommonDocParams) {
    return this.request<Project>('PATCH', `/api/projects/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deleteProject(id: ID, params?: CommonDocParams) {
    return this.request<Project>('DELETE', `/api/projects/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Posts (note: paths are /api/post)
   * ---------------------------- */

  listPosts(params?: CommonListParams) {
    return this.request<PayloadListResponse<Post>>('GET', '/api/post', { query: params, auth: true })
  }

  createPost(body: Pick<Post, 'title' | 'slug'> & Partial<Post>, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<Post>>('POST', '/api/post', { body, query: params, auth: true })
  }

  findPostById(id: ID, params?: CommonDocParams) {
    return this.request<Post>('GET', `/api/post/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  updatePost(id: ID, body: Partial<Post>, params?: CommonDocParams) {
    return this.request<Post>('PATCH', `/api/post/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deletePost(id: ID, params?: CommonDocParams) {
    return this.request<Post>('DELETE', `/api/post/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Pages (note: paths are /api/page)
   * ---------------------------- */

  listPages(params?: CommonListParams) {
    return this.request<PayloadListResponse<Page>>('GET', '/api/page', { query: params, auth: true })
  }

  createPage(body: Pick<Page, 'title' | 'slug'> & Partial<Page>, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<Page>>('POST', '/api/page', { body, query: params, auth: true })
  }

  findPageById(id: ID, params?: CommonDocParams) {
    return this.request<Page>('GET', `/api/page/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  updatePage(id: ID, body: Partial<Page>, params?: CommonDocParams) {
    return this.request<Page>('PATCH', `/api/page/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deletePage(id: ID, params?: CommonDocParams) {
    return this.request<Page>('DELETE', `/api/page/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Payload KV
   * ---------------------------- */

  listPayloadKv(params?: CommonListParams) {
    return this.request<PayloadListResponse<PayloadKv>>('GET', '/api/payload-kv', { query: params, auth: true })
  }

  createPayloadKv(body: Pick<PayloadKv, 'key' | 'data'>, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<PayloadKv>>('POST', '/api/payload-kv', { body, query: params, auth: true })
  }

  findPayloadKvById(id: ID, params?: CommonDocParams) {
    return this.request<PayloadKv>('GET', `/api/payload-kv/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  updatePayloadKv(id: ID, body: Partial<PayloadKv>, params?: CommonDocParams) {
    return this.request<PayloadKv>('PATCH', `/api/payload-kv/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deletePayloadKv(id: ID, params?: CommonDocParams) {
    return this.request<PayloadKv>('DELETE', `/api/payload-kv/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Folders
   * ---------------------------- */

  listFolders(params?: CommonListParams) {
    return this.request<PayloadListResponse<Folder>>('GET', '/api/payload-folders', { query: params, auth: true })
  }

  createFolder(body: Pick<Folder, 'name'> & Partial<Folder>, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<Folder>>('POST', '/api/payload-folders', { body, query: params, auth: true })
  }

  findFolderById(id: ID, params?: CommonDocParams) {
    return this.request<Folder>('GET', `/api/payload-folders/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  updateFolder(id: ID, body: Partial<Folder>, params?: CommonDocParams) {
    return this.request<Folder>('PATCH', `/api/payload-folders/${encodeURIComponent(id)}`, { body, query: params, auth: true })
  }

  deleteFolder(id: ID, params?: CommonDocParams) {
    return this.request<Folder>('DELETE', `/api/payload-folders/${encodeURIComponent(id)}`, { query: params, auth: true })
  }

  /** -----------------------------
   * Locked documents
   * ---------------------------- */

  listLockedDocuments(params?: CommonListParams) {
    return this.request<PayloadListResponse<PayloadLockedDocument>>('GET', '/api/payload-locked-documents', {
      query: params,
      auth: true,
    })
  }

  createLockedDocument(
    body: { user: string; document?: string; globalSlug?: string | null },
    params?: Pick<CommonDocParams, 'depth' | 'locale'>,
  ) {
    return this.request<NewDocResponse<PayloadLockedDocument>>('POST', '/api/payload-locked-documents', {
      body,
      query: params,
      auth: true,
    })
  }

  findLockedDocumentById(id: ID, params?: CommonDocParams) {
    return this.request<PayloadLockedDocument>('GET', `/api/payload-locked-documents/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }

  updateLockedDocument(id: ID, body: Partial<{ user: string; document: string; globalSlug: string | null }>, params?: CommonDocParams) {
    return this.request<PayloadLockedDocument>('PATCH', `/api/payload-locked-documents/${encodeURIComponent(id)}`, {
      body,
      query: params,
      auth: true,
    })
  }

  deleteLockedDocument(id: ID, params?: CommonDocParams) {
    return this.request<PayloadLockedDocument>('DELETE', `/api/payload-locked-documents/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }

  /** -----------------------------
   * Preferences
   * ---------------------------- */

  listPreferences(params?: CommonListParams) {
    return this.request<PayloadListResponse<PayloadPreference>>('GET', '/api/payload-preferences', {
      query: params,
      auth: true,
    })
  }

  createPreference(body: { user: string; key?: string | null; value?: any }, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<PayloadPreference>>('POST', '/api/payload-preferences', {
      body,
      query: params,
      auth: true,
    })
  }

  findPreferenceById(id: ID, params?: CommonDocParams) {
    return this.request<PayloadPreference>('GET', `/api/payload-preferences/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }

  updatePreference(id: ID, body: Partial<{ user: string; key: string | null; value: any }>, params?: CommonDocParams) {
    return this.request<PayloadPreference>('PATCH', `/api/payload-preferences/${encodeURIComponent(id)}`, {
      body,
      query: params,
      auth: true,
    })
  }

  deletePreference(id: ID, params?: CommonDocParams) {
    return this.request<PayloadPreference>('DELETE', `/api/payload-preferences/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }

  /** -----------------------------
   * Migrations
   * ---------------------------- */

  listMigrations(params?: CommonListParams) {
    return this.request<PayloadListResponse<PayloadMigration>>('GET', '/api/payload-migrations', {
      query: params,
      auth: true,
    })
  }

  createMigration(body: Partial<PayloadMigration>, params?: Pick<CommonDocParams, 'depth' | 'locale'>) {
    return this.request<NewDocResponse<PayloadMigration>>('POST', '/api/payload-migrations', {
      body,
      query: params,
      auth: true,
    })
  }

  findMigrationById(id: ID, params?: CommonDocParams) {
    return this.request<PayloadMigration>('GET', `/api/payload-migrations/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }

  updateMigration(id: ID, body: Partial<PayloadMigration>, params?: CommonDocParams) {
    return this.request<PayloadMigration>('PATCH', `/api/payload-migrations/${encodeURIComponent(id)}`, {
      body,
      query: params,
      auth: true,
    })
  }

  deleteMigration(id: ID, params?: CommonDocParams) {
    return this.request<PayloadMigration>('DELETE', `/api/payload-migrations/${encodeURIComponent(id)}`, {
      query: params,
      auth: true,
    })
  }
}

/** -----------------------------
 * Convenience singleton factory
 * ---------------------------- */

export function createDaramisApiClient(opts: ApiClientOptions = {}) {
  return new DaramisApiClient(opts)
}