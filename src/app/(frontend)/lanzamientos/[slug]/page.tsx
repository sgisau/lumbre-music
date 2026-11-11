import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Frame, ProductCard } from '@/components/cards'
import { VideoPlayer } from '@/components/VideoPlayer'
import { formatDate, getPayloadClient, isFuture, mediaUrl, RELEASE_TYPES, spotifyEmbed, youtubeId } from '@/lib/payload'
import type { Artist } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

const getRelease = async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'releases', where: { slug: { equals: slug }, _status: { equals: 'published' } }, limit: 1, depth: 1 })
  return res.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRelease((await params).slug)
  if (!r) return {}
  const img = mediaUrl(r.cover, 'hero')
  return { title: r.title, openGraph: img ? { images: [img] } : undefined }
}

export default async function ReleasePage({ params }: Props) {
  const release = await getRelease((await params).slug)
  if (!release) notFound()

  const artists = (release.artists || []).filter((a): a is Artist => typeof a === 'object')
  const payload = await getPayloadClient()
  const [videos, products] = await Promise.all([
    payload.find({ collection: 'videos', where: { release: { equals: release.id } }, limit: 3, depth: 0 }),
    artists.length
      ? payload.find({ collection: 'products', where: { artist: { in: artists.map((a) => a.id) }, visible: { equals: true } }, sort: 'order', limit: 4, depth: 1 })
      : Promise.resolve({ docs: [] }),
  ])

  const upcoming = isFuture(release.releaseDate)
  const embed = spotifyEmbed(release.spotifyUrl)
  const links = [
    { label: 'Apple Music', url: release.appleMusicUrl },
    { label: 'YouTube', url: release.youtubeUrl },
    ...(release.otherLinks || []).map((l) => ({ label: l.label, url: l.url })),
  ].filter((l) => l.url)

  return (
    <>
      <section className="wrap g-12" style={{ paddingTop: 56, paddingBottom: 96, alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 6' }}>
          <Frame media={release.cover} ratio="r-11" size="hero" eager label={release.cover ? undefined : 'Portada provisional'} />
        </div>
        <div style={{ gridColumn: '8 / span 5', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Link href="/lanzamientos" className="mono" style={{ color: 'var(--cromo)', textDecoration: 'none' }}>
            ← Lanzamientos
          </Link>
          <div className="tags">
            <span className="tag tag-solid">{upcoming ? 'Próximamente' : RELEASE_TYPES[release.type]}</span>
            <span className="tag tag-outline">
              {formatDate(release.releaseDate)}
              {release.catalogNumber ? ` · ${release.catalogNumber}` : ''}
            </span>
          </div>
          <h1 className="disp" style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}>
            {release.title}
          </h1>
          <p className="disp disp-800" style={{ fontSize: 24 }}>
            {artists.map((a, i) => (
              <span key={a.id}>
                {i > 0 ? ', ' : ''}
                <Link href={`/artistas/${a.slug}`} style={{ textDecoration: 'none' }}>
                  {a.name}
                </Link>
              </span>
            ))}
          </p>
          <div className="actions">
            {upcoming && release.presaveUrl ? (
              <a className="btn btn-primary" href={release.presaveUrl} target="_blank" rel="noreferrer">
                Pre-save
              </a>
            ) : release.spotifyUrl ? (
              <a className="btn btn-primary" href={release.spotifyUrl} target="_blank" rel="noreferrer">
                Escuchar en Spotify
              </a>
            ) : null}
            {links.map((l) => (
              <a key={l.url!} className="btn btn-outline" href={l.url!} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
          {release.tracklist?.length ? (
            <ol className="tracklist" aria-label="Lista de canciones">
              {release.tracklist.map((t, i) => (
                <li key={t.id || i}>
                  {String(i + 1).padStart(2, '0')} · {t.title}
                </li>
              ))}
            </ol>
          ) : null}
          {embed && !upcoming ? (
            <iframe className="embed" src={embed} height={152} loading="lazy" title={`${release.title} en Spotify`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
          ) : null}
          {release.credits ? (
            <div>
              <p className="mono quiet" style={{ marginBottom: 8 }}>
                Créditos
              </p>
              <p className="muted" style={{ whiteSpace: 'pre-line', fontSize: 15 }}>
                {release.credits}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {videos.docs.length ? (
        <section className="wrap section-tight">
          <div className="sec-head rule-top">
            <h2 className="disp h-m">Video</h2>
          </div>
          <div className="grid g-2">
            {videos.docs.map((v) => {
              const id = youtubeId(v.youtubeUrl)
              return id ? (
                <div key={v.id} className="card">
                  <VideoPlayer id={id} title={v.title} vertical={v.kind === 'clip'} big />
                  <span className="card-title">{v.title}</span>
                </div>
              ) : null
            })}
          </div>
        </section>
      ) : null}

      {products.docs.length ? (
        <section>
          <div className="torn" aria-hidden="true" />
          <div className="light">
            <div className="wrap" style={{ paddingTop: 48, paddingBottom: 104 }}>
              <div className="sec-head">
                <h2 className="disp h-m">Merch relacionada</h2>
                <Link className="link-arrow" href="/tienda">
                  Tienda →
                </Link>
              </div>
              <div className="grid g-4">
                {products.docs.map((p) => (
                  <ProductCard key={p.id} product={p} light />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
