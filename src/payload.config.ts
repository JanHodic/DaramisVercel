import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Projects } from './collections/Projects'
import { Locations } from './collections/Locations'
import { PointsOfInterest } from './collections/PointsOfInterest'
import { Galleries } from './collections/Galleries'
import { Timelines } from './collections/Timelines'
import { UnitConfigs } from './collections/UnitConfigs'
import { MapPoints } from './collections/MapPoints'
import { AppSettings } from './globals/AppSettings'
import { TimelineItems } from './collections/TimelineItems'
import { PointOfInterestCategories } from './collections/PointsOfInterestCategories/PointsOfInterestCategories'
import { Amenities } from './collections/Amenities'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  localization: {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    fallback: true,
  },
  admin: {
    theme: 'light',
    components: {
      // Custom Daramis branding
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
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
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Pages, 
    Posts, 
    Media, 
    Categories, 
    Users, 
    Projects,
    Locations,
    PointsOfInterest,
    Galleries,
    Timelines,
    TimelineItems,
    UnitConfigs,
    Amenities,
    PointOfInterestCategories,
    MapPoints,],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, AppSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
