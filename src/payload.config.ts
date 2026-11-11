import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Artists } from './collections/Artists'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Releases } from './collections/Releases'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { migrations } from './migrations'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    avatar: 'default',
    meta: {
      titleSuffix: ' · Panel Lumbre Music',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  collections: [Artists, Releases, Videos, Events, Products, Media, Users],
  globals: [HomePage, SiteSettings, AboutPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // En producción las tablas se crean/actualizan con las migraciones al arrancar.
    prodMigrations: migrations,
  }),
  jobs: {
    // Publica los lanzamientos programados. En un servidor propio corre solo;
    // en Vercel lo dispara el cron definido en vercel.json.
    autoRun: process.env.VERCEL ? undefined : [{ cron: '* * * * *', queue: 'default' }],
    access: {
      run: ({ req }) => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        return Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`
      },
    },
  },
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: { media: true },
      token: blobToken || '',
    }),
  ],
})
