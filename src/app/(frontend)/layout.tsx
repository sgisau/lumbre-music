import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getSettings, mediaUrl } from '@/lib/payload'

import './styles.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const name = s.siteName || 'Lumbre Music'
  const icon = mediaUrl(s.favicon)
  const share = mediaUrl(s.shareImage, 'hero')
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: { default: name, template: `%s · ${name}` },
    description: s.seoDescription || undefined,
    icons: icon ? { icon } : undefined,
    openGraph: share ? { images: [share], siteName: name } : { siteName: name },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const logo = settings.logo && typeof settings.logo === 'object' ? settings.logo : null

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Manrope:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <a href="#contenido" className="sr-only">
          Saltar al contenido
        </a>
        <div className="grain" aria-hidden="true" />
        {settings.announcementEnabled && settings.announcementText ? (
          settings.announcementUrl ? (
            <a className="announce" href={settings.announcementUrl}>
              {settings.announcementText}
            </a>
          ) : (
            <p className="announce">{settings.announcementText}</p>
          )
        ) : null}
        <SiteHeader logoUrl={mediaUrl(logo)} logoAlt={logo?.alt || settings.siteName || 'Lumbre Music'} siteName={settings.siteName || 'Lumbre Music'} />
        <main id="contenido">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  )
}
