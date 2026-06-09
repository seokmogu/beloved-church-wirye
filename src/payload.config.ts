import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest, type TaskConfig } from 'payload'
// @ts-ignore – ko translations bundled at runtime
import { ko } from '@payloadcms/translations/languages/ko'
import { fileURLToPath } from 'url'

import { Announcements } from './collections/Announcements'
import { Bulletins } from './collections/Bulletins'
import { ChurchNews } from './collections/ChurchNews'
import { ChurchVideos } from './collections/ChurchVideos'
import { Media } from './collections/Media'
import { Newcomers } from './collections/Newcomers'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Sermons } from './collections/Sermons'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { OfferingPage } from './globals/OfferingPage'
import { SpecialBanner } from './globals/SpecialBanner'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getPayloadAllowedOrigins, getPayloadServerURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { syncInstagramPosts } from './lib/instagram'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const allowedOrigins = getPayloadAllowedOrigins()
const serverURL = getPayloadServerURL()

// TEMP diagnostic: captures the blob-token boolean at the moment THIS config module is
// evaluated (build vs runtime). Compare with a fresh runtime process.env read.
export const __BLOB_ENABLED_AT_EVAL = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const syncInstagramPostsTask: TaskConfig<{
  input: Record<string, never>
  output: { count: number }
}> = {
  handler: async ({ req }) => {
    const result = await syncInstagramPosts(req.payload)

    return {
      output: {
        count: result.count,
      },
    }
  },
  label: 'Instagram 최신 게시물 동기화',
  outputSchema: [
    {
      name: 'count',
      type: 'number',
    },
  ],
  schedule: [
    {
      cron: '0 0 */6 * * *',
      queue: 'default',
    },
  ],
  slug: 'syncInstagramPosts',
}

export default buildConfig({
  i18n: {
    supportedLanguages: { ko },
    fallbackLanguage: 'ko',
  },
  admin: {
    components: {
      Nav: '@/components/admin/OrderedNav#OrderedNav',
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
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
    suppressHydrationWarning: true,
    theme: 'light',
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    push: false,
  }),
  collections: [
    Pages,
    Announcements,
    ChurchNews,
    ChurchVideos,
    Bulletins,
    Sermons,
    Posts,
    Newcomers,
    Media,
    Users,
  ],
  serverURL,
  csrf: [],
  cors: allowedOrigins,
  plugins: [
    ...plugins,
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  globals: [SiteSettings, Header, Footer, SpecialBanner, OfferingPage],
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

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [syncInstagramPostsTask],
  },
})
