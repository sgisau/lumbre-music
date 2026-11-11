import type { Metadata } from 'next'

import { Frame } from '@/components/cards'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = { title: 'Nosotros' }

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about-page', depth: 1 })
  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head">
        <h1 className="disp">{about.title || 'Nosotros'}</h1>
      </header>
      <div className="g-12">
        {about.image ? (
          <div style={{ gridColumn: 'span 5' }}>
            <Frame media={about.image} ratio="r-45" />
          </div>
        ) : null}
        <div style={{ gridColumn: about.image ? '7 / span 6' : 'span 8' }}>
          {about.content ? <RichText data={about.content} /> : <p className="empty mono">El texto de esta página se escribe en el panel: Página Nosotros.</p>}
        </div>
      </div>
    </div>
  )
}
