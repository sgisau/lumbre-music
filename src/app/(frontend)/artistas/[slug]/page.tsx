import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EventRow, Frame, ProductCard, ReleaseCard } from '@/components/cards'
import { RichText } from '@/components/RichText'
import { VideoPlayer } from '@/components/VideoPlayer'
import { formatDate, formatListeners, getPayloadClient, mediaUrl, spotifyEmbed, youtubeId } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

const getArtist = async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'artists', where: { slug: { equals: slug }, visible: { equals: true } }, limit: 1, depth: 1 })
  return res.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await getArtist((await params).slug)
  if (!artist) return {}
  const img = mediaUrl(artist.headerPhoto || artist.photo, 'hero')
  return { title: artist.name, openGraph: img ? { images: [img] } : undefined }
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params
  const artist = await getArtist(slug)
  if (!artist) notFound()

  const payload = await getPayloadClient()
  const [releases, videos, events, products] = await Promise.all([
    payload.find({ collection: 'releases', where: { artists: { contains: artist.id }, _status: { equals: 'published' } }, sort: '-releaseDate', limit: 24, depth: 1 }),
    payload.find({ collection: 'videos', where: { artists: { contains: artist.id } }, sort: '-publishedAt', limit: 6, depth: 0 }),
    payload.find({ collection: 'events', where: { artists: { contains: artist.id }, date: { greater_than_equal: new Date().toISOString() } }, sort: 'date', limit: 10, depth: 1 }),
    payload.find({ collection: 'products', where: { artist: { equals: artist.id }, visible: { equals: true } }, sort: 'order', limit: 8, depth: 1 }),
  ])

  const listeners = formatListeners(artist.monthlyListeners)
  const embed = spotifyEmbed(artist.spotifyUrl) || spotifyEmbed(releases.docs[0]?.spotifyUrl)
  const platforms = [
    { label: 'Apple Music', url: artist.appleMusicUrl },
    { label: 'YouTube', url: artist.youtubeUrl },
    ...(artist.socials || []).map((s) => ({ label: s.label, url: s.url })),
  ].filter((p) => p.url)

  return (
    <>
      <section className="artist-hero">
        <div className="hero-media">
          <Frame media={artist.headerPhoto || artist.photo} ratio="r-169" size="hero" eager label={artist.headerPhoto || artist.photo ? undefined : 'Foto provisional'} />
        </div>
        <div className="wrap hero-inner">
          <Link href="/artistas" className="mono" style={{ color: 'var(--cromo)', textDecoration: 'none', minHeight: 44, display: 'flex', alignItems: 'center' }}>
            ← Artistas
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {listeners ? (
              <div className="tags">
                <span className="tag tag-outline" style={{ fontSize: 12, padding: '8px 12px' }}>
                  Oyentes mensuales · {listeners}
                </span>
                {artist.listenersUpdatedAt ? (
                  <span className="tag tag-dim" style={{ fontSize: 12, padding: '8px 12px' }}>
                    Act. {formatDate(artist.listenersUpdatedAt, { month: 'short' })}
                  </span>
                ) : null}
              </div>
            ) : null}
            <h1 className="disp artist-name">{artist.name}</h1>
            <div className="actions">
              {artist.spotifyUrl ? (
                <a className="btn btn-primary" href={artist.spotifyUrl} target="_blank" rel="noreferrer">
                  Escuchar en Spotify
                </a>
              ) : null}
              {platforms.map((p) => (
                <a key={p.url!} className="btn btn-outline" href={p.url!} target="_blank" rel="noreferrer">
                  {p.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav className="subnav mono wrap" aria-label="Secciones del artista">
        <a href="#musica">Música</a>
        {videos.docs.length ? <a href="#videos">Videos</a> : null}
        {events.docs.length ? <a href="#fechas">Fechas</a> : null}
        {products.docs.length ? <a href="#merch">Merch</a> : null}
        {artist.bio ? <a href="#bio">Bio</a> : null}
      </nav>

      {embed || releases.docs.length ? (
        <section id="musica" className="wrap section g-12">
          <div style={{ gridColumn: embed ? 'span 5' : '1 / -1', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="mono" style={{ color: 'var(--cromo)' }}>
              Escucha
            </p>
            <h2 className="disp h-l">Música</h2>
            {embed ? (
              <iframe className="embed" src={embed} height={380} loading="lazy" title={`${artist.name} en Spotify`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
            ) : null}
          </div>
          <div style={{ gridColumn: embed ? '7 / span 6' : '1 / -1', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="mono" style={{ color: 'var(--cromo)' }}>
              Discografía
            </p>
            <div className={`grid ${embed ? 'g-3' : 'g-5'}`}>
              {releases.docs.map((r) => (
                <ReleaseCard key={r.id} release={r} showArtist={false} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {videos.docs.length ? (
        <section id="videos" className="wrap section-tight">
          <div className="sec-head rule-top">
            <h2 className="disp h-m">Videos</h2>
            <Link className="link-arrow" href={`/videos?artista=${artist.slug}`}>
              Todos sus videos →
            </Link>
          </div>
          <div className="grid g-3">
            {videos.docs.slice(0, 3).map((v) => {
              const id = youtubeId(v.youtubeUrl)
              return id ? (
                <div key={v.id} className="card">
                  <VideoPlayer id={id} title={v.title} vertical={v.kind === 'clip'} />
                  <span className="card-title">{v.title}</span>
                </div>
              ) : null
            })}
          </div>
        </section>
      ) : null}

      {events.docs.length ? (
        <section id="fechas" className="wrap section-tight g-12">
          <div className="rule-top" style={{ gridColumn: 'span 4' }}>
            <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 12 }}>
              En vivo
            </p>
            <h2 className="disp h-m">Fechas</h2>
          </div>
          <ul className="events" style={{ gridColumn: '5 / span 8' }}>
            {events.docs.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </ul>
        </section>
      ) : null}

      {products.docs.length ? (
        <section id="merch">
          <div className="torn" aria-hidden="true" />
          <div className="light">
            <div className="wrap" style={{ paddingTop: 48, paddingBottom: 104 }}>
              <div className="sec-head">
                <div>
                  <p className="mono eyebrow">Tienda</p>
                  <h2 className="disp h-l">Merch de {artist.name}</h2>
                </div>
                <Link className="btn btn-primary" href={`/tienda?artista=${artist.slug}`}>
                  Ver toda la merch
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

      {artist.bio ? (
        <section id="bio" className="wrap section g-12">
          <div style={{ gridColumn: 'span 4' }}>
            <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 12 }}>
              Historia
            </p>
            <h2 className="disp h-m">Bio</h2>
          </div>
          <div style={{ gridColumn: '5 / span 7' }}>
            <RichText data={artist.bio} />
          </div>
        </section>
      ) : null}

      {artist.bookingEmail ? (
        <section className="band">
          <div className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <p className="disp disp-800" style={{ fontSize: 32 }}>
              Booking y prensa
            </p>
            <a className="btn btn-outline" href={`mailto:${artist.bookingEmail}`}>
              {artist.bookingEmail}
            </a>
          </div>
        </section>
      ) : null}
    </>
  )
}
