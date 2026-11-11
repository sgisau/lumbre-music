import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'

import { ReleaseCard } from '@/components/cards'
import { getPayloadClient, RELEASE_TYPES } from '@/lib/payload'

export const metadata: Metadata = { title: 'Lanzamientos' }

type Props = { searchParams: Promise<{ artista?: string; tipo?: string }> }

export default async function ReleasesPage({ searchParams }: Props) {
  const { artista, tipo } = await searchParams
  const payload = await getPayloadClient()
  const artists = await payload.find({ collection: 'artists', where: { visible: { equals: true } }, sort: 'order', limit: 100, depth: 0 })
  const selected = artists.docs.find((a) => a.slug === artista)

  const where: Where = { _status: { equals: 'published' } }
  if (selected) where.artists = { contains: selected.id }
  if (tipo && RELEASE_TYPES[tipo]) where.type = { equals: tipo }

  const releases = await payload.find({ collection: 'releases', where, sort: '-releaseDate', limit: 120, depth: 1 })

  const href = (next: { artista?: string | null; tipo?: string | null }) => {
    const params = new URLSearchParams()
    const a = next.artista === undefined ? artista : next.artista
    const t = next.tipo === undefined ? tipo : next.tipo
    if (a) params.set('artista', a)
    if (t) params.set('tipo', t)
    const q = params.toString()
    return q ? `/lanzamientos?${q}` : '/lanzamientos'
  }

  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head">
        <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 16 }}>
          Música
        </p>
        <h1 className="disp">Lanzamientos</h1>
      </header>
      <nav className="filters" aria-label="Filtrar por tipo">
        <Link className="chip" href={href({ tipo: null })} aria-current={!tipo ? 'true' : undefined}>
          Todos
        </Link>
        {Object.entries(RELEASE_TYPES).map(([value, label]) => (
          <Link key={value} className="chip" href={href({ tipo: value })} aria-current={tipo === value ? 'true' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      {artists.docs.length > 1 ? (
        <nav className="filters" aria-label="Filtrar por artista">
          <Link className="chip" href={href({ artista: null })} aria-current={!selected ? 'true' : undefined}>
            Todos los artistas
          </Link>
          {artists.docs.map((a) => (
            <Link key={a.id} className="chip" href={href({ artista: a.slug })} aria-current={selected?.id === a.id ? 'true' : undefined}>
              {a.name}
            </Link>
          ))}
        </nav>
      ) : null}
      {releases.docs.length ? (
        <div className="grid g-4">
          {releases.docs.map((r) => (
            <ReleaseCard key={r.id} release={r} />
          ))}
        </div>
      ) : (
        <p className="empty mono">No hay lanzamientos con estos filtros.</p>
      )}
    </div>
  )
}
