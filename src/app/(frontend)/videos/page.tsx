import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'

import { VideoPlayer } from '@/components/VideoPlayer'
import { formatDate, getPayloadClient, youtubeId } from '@/lib/payload'

export const metadata: Metadata = { title: 'Videos' }

type Props = { searchParams: Promise<{ formato?: string; artista?: string }> }

export default async function VideosPage({ searchParams }: Props) {
  const { formato, artista } = await searchParams
  const kind = formato === 'clip' ? 'clip' : 'video'
  const payload = await getPayloadClient()
  const artists = await payload.find({ collection: 'artists', where: { visible: { equals: true } }, sort: 'order', limit: 100, depth: 0 })
  const selected = artists.docs.find((a) => a.slug === artista)

  const where: Where = { kind: { equals: kind } }
  if (selected) where.artists = { contains: selected.id }
  const videos = await payload.find({ collection: 'videos', where, sort: '-publishedAt', limit: 120, depth: 0 })

  const href = (k: string, a?: string | null) => {
    const p = new URLSearchParams()
    if (k === 'clip') p.set('formato', 'clip')
    if (a) p.set('artista', a)
    const q = p.toString()
    return q ? `/videos?${q}` : '/videos'
  }

  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head sec-head" style={{ marginBottom: 0 }}>
        <div>
          <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 16 }}>
            Visual
          </p>
          <h1 className="disp">Videos</h1>
        </div>
        <nav className="tabs" aria-label="Formato">
          <Link href={href('video', artista)} aria-current={kind === 'video' ? 'true' : undefined}>
            Videos
          </Link>
          <Link href={href('clip', artista)} aria-current={kind === 'clip' ? 'true' : undefined}>
            Clips
          </Link>
        </nav>
      </header>
      {artists.docs.length > 1 ? (
        <nav className="filters" aria-label="Filtrar por artista">
          <Link className="chip" href={href(kind)} aria-current={!selected ? 'true' : undefined}>
            Todos
          </Link>
          {artists.docs.map((a) => (
            <Link key={a.id} className="chip" href={href(kind, a.slug)} aria-current={selected?.id === a.id ? 'true' : undefined}>
              {a.name}
            </Link>
          ))}
        </nav>
      ) : null}
      {videos.docs.length ? (
        <div className={`grid ${kind === 'clip' ? 'g-4' : 'g-3'}`}>
          {videos.docs.map((v) => {
            const id = youtubeId(v.youtubeUrl)
            return id ? (
              <div key={v.id} className="card">
                <VideoPlayer id={id} title={v.title} vertical={kind === 'clip'} />
                <span className="card-title">{v.title}</span>
                {v.publishedAt ? <span className="mono quiet" style={{ fontSize: 10 }}>{formatDate(v.publishedAt)}</span> : null}
              </div>
            ) : null
          })}
        </div>
      ) : (
        <p className="empty mono">{kind === 'clip' ? 'Aún no hay clips.' : 'Aún no hay videos.'}</p>
      )}
    </div>
  )
}
