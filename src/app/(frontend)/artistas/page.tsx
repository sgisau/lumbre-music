import type { Metadata } from 'next'

import { ArtistCard } from '@/components/cards'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = { title: 'Artistas' }

export default async function ArtistsPage() {
  const payload = await getPayloadClient()
  const artists = await payload.find({ collection: 'artists', where: { visible: { equals: true } }, sort: 'order', limit: 100, depth: 1 })
  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head">
        <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 16 }}>
          Roster
        </p>
        <h1 className="disp">Artistas</h1>
      </header>
      {artists.docs.length ? (
        <div className="grid g-4">
          {artists.docs.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      ) : (
        <p className="empty mono">Aún no hay artistas publicados.</p>
      )}
    </div>
  )
}
