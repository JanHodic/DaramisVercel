import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { openapi, swaggerUI } from 'payload-oapi'
import { s3Storage } from '@payloadcms/storage-s3'

// ✅ Admin UI translations
import { en } from '@payloadcms/translations/languages/en'
import { cs } from '@payloadcms/translations/languages/cs'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { getServerSideURL } from './utilities/getURL'
import { Projects } from './collections/Projects'
import { publicEndpoints } from './endpoints/public/public'
import { Post } from './collections/Posts'
import { Page } from './collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL

if (!connectionString) {
  throw new Error('Missing POSTGRES_URL / DATABASE_URL / NEON_DATABASE_URL')
}

export default buildConfig({
  // ✅ Admin UI language (labels/buttons in CMS)
  i18n: {
    supportedLanguages: { cs, en },
    fallbackLanguage: 'cs',
  },

  // ✅ Content localization (localized fields + ?locale=cs)
  localization: {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    fallback: true,
  },

  endpoints: [...publicEndpoints],

  serverURL:
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),


  admin: {
    theme: 'light',
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      beforeLogin: ['@/components/BeforeLogin'],
    },
    meta: {
      titleSuffix: '- Daramis Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon-daramis-logo.png',
        },
      ],
    },
    importMap: {
      baseDir: path.resolve(process.cwd()),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  collections: [
    Media,
    Users,
    Projects,
    Post,
    Page
  ],

  cors: [
    getServerSideURL(),
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://172.20.10.10:3001',
  ].filter(Boolean),

  csrf: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://172.20.10.10:3001',
  ],

  plugins: [
    openapi({
      openapiVersion: '3.0',
      metadata: { title: 'Daramis API', version: '1.0.0' },
    }),
    swaggerUI({}),
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
          generateFileURL: ({ filename, prefix }) => {
            const base = process.env.R2_PUBLIC_BASE_URL
            const key = prefix ? `${prefix}/${filename}` : filename
            return `${base}/${key}`
          },
        },
      },
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: process.env.R2_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true,
      },
      bucket: process.env.R2_BUCKET!,
    }),
  ],

  secret: process.env.PAYLOAD_SECRET,

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  jobs: {
    access: {
      run: () => true,
    },
  },
})