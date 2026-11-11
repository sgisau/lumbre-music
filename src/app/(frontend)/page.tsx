import Link from 'next/link'

import { ArtistCard, EventRow, Frame, ProductCard, ReleaseCard } from '@/components/cards'
import { VideoPlayer } from '@/components/VideoPlayer'
import { HOME_BLOCKS } from '@/globals/HomePage'
import { getPayloadClient, getSettings, isFuture, RELEASE_TYPES, formatDate, youtubeId } from '@/lib/payload'
import type { Product, Release } from '@/payload-types'

const names = (r: Release) =>
  (r.artists || [])
    .map((a) => (typeof a === 'object' ? a.name : null))
    .filter(Boolean)
    .join(', ')

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, settings] = await Promise.all([payload.findGlobal({ slug: 'home-page', depth: 2 }), getSettings()])

  const latest = await payload.find({ collection: 'releases', sort: '-releaseDate', limit: 6, depth: 1, where: { _status: { equals: 'published' } } })
  const heroRelease = (typeof home.heroRelease === 'object' && home.heroRelease) || latest.docs[0] || null
  const featured = (typeof home.featuredRelease === 'object' && home.featuredRelease) || heroRelease

  const [artists, videos, events, productsRes] = await Promise.all([
    payload.find({ collection: 'artists', where: { visible: { equals: true } }, sort: 'order', limit: 8, depth: 1 }),
    payload.find({ collection: 'videos', where: { kind: { equals: 'video' } }, sort: ['-featured', '-publishedAt'], limit: 3, depth: 0 }),
    payload.find({ collection: 'events', where: { date: { greater_than_equal: new Date().toISOString() } }, sort: 'date', limit: 4, depth: 1 }),
    payload.find({ collection: 'products', where: { visible: { equals: true } }, sort: 'order', limit: 4, depth: 1 }),
  ])
  const dropProducts = (home.dropProducts || []).filter((p): p is Product => typeof p === 'object' && p !== null && p.visible !== false)
  const products = dropProducts.length ? dropProducts.slice(0, 8) : productsRes.docs

  const order = home.blocks?.length ? home.blocks : HOME_BLOCKS.map((b) => ({ block: b.value, visible: true, id: b.value }))

  const blocks: Record<string, React.ReactNode> = {
    featured: featured ? (
      <section key="featured">
        <div className="torn" aria-hidden="true" />
        <div className="light">
          <div className="wrap featured">
            <Frame media={featured.cover} ratio="r-11" size="hero" className="featured-cover" label={featured.cover ? undefined : 'Portada provisional'} />
            <div className="featured-body">
              <p className="mono muted">
                Destacado · {RELEASE_TYPES[featured.type]} · {formatDate(featured.releaseDate)}
              </p>
              <h2 className="disp h-l">{featured.title}</h2>
              <p className="disp disp-800" style={{ fontSize: 24 }}>
                {names(featured)}
              </p>
              {featured.tracklist?.length ? (
                <ol className="tracklist">
                  {featured.tracklist.slice(0, 5).map((t, i) => (
                    <li key={t.id || i}>
                      {String(i + 1).padStart(2, '0')} · {t.title}
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="actions">
                {featured.spotifyUrl ? (
                  <a className="btn btn-dark" href={featured.spotifyUrl} target="_blank" rel="noreferrer">
                    Spotify
                  </a>
                ) : null}
                {featured.appleMusicUrl ? (
                  <a className="btn btn-outline-dark" href={featured.appleMusicUrl} target="_blank" rel="noreferrer">
                    Apple Music
                  </a>
                ) : null}
                {featured.youtubeUrl ? (
                  <a className="btn btn-outline-dark" href={featured.youtubeUrl} target="_blank" rel="noreferrer">
                    YouTube
                  </a>
                ) : null}
                <Link className="link-arrow" style={{ alignSelf: 'center' }} href={`/lanzamientos/${featured.slug}`}>
                  Ver lanzamiento →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : null,

    roster: artists.docs.length ? (
      <section key="roster" className="wrap section">
        <div className="sec-head">
          <div>
            <p className="mono eyebrow">Roster</p>
            <h2 className="disp h-xl">Artistas</h2>
          </div>
          <Link className="link-arrow" href="/artistas">
            Ver todos →
          </Link>
        </div>
        <div className="grid g-4">
          {artists.docs.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>
    ) : null,

    releases: latest.docs.length ? (
      <section key="releases" className="wrap section-tight">
        <div className="sec-head rule-top">
          <h2 className="disp h-m">Últimos lanzamientos</h2>
          <Link className="link-arrow" href="/lanzamientos">
            Todos →
          </Link>
        </div>
        <div className="grid g-5">
          {latest.docs.slice(0, 5).map((r) => (
            <ReleaseCard key={r.id} release={r} />
          ))}
        </div>
      </section>
    ) : null,

    drop: products.length ? (
      <section key="drop">
        <div className="torn" aria-hidden="true" />
        <div className="light">
          <div className="wrap" style={{ paddingTop: 48, paddingBottom: 104 }}>
            <div className="sec-head">
              <div>
                <p className="mono eyebrow">Tienda</p>
                <h2 className="disp h-xl">{home.dropTitle || 'Merch'}</h2>
              </div>
              <Link className="btn btn-primary" href="/tienda">
                Ver tienda
              </Link>
            </div>
            <div className="grid g-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} light />
              ))}
            </div>
          </div>
        </div>
      </section>
    ) : null,

    videos: videos.docs.length ? (
      <section key="videos" className="wrap section">
        <div className="sec-head">
          <div>
            <p className="mono eyebrow">Visual</p>
            <h2 className="disp h-xl">Videos</h2>
          </div>
          <nav className="tabs" aria-label="Formato de video">
            <Link href="/videos" aria-current="true">
              Videos
            </Link>
            <Link href="/videos?formato=clip">Clips</Link>
          </nav>
        </div>
        <div className="grid g-3 g-videos">
          {videos.docs.map((v, i) => {
            const id = youtubeId(v.youtubeUrl)
            if (!id) return null
            return (
              <div key={v.id} className="card" style={i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : undefined}>
                <VideoPlayer id={id} title={v.title} big={i === 0} />
                <span className="card-title" style={i === 0 ? { fontSize: 22 } : undefined}>
                  {v.title}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    ) : null,

    events: (
      <section key="events" className="wrap section">
        {events.docs.length ? (
          <div className="g-12">
            <div className="rule-top" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="mono" style={{ color: 'var(--cromo)' }}>
                En vivo
              </p>
              <h2 className="disp h-l">Fechas</h2>
              <Link className="link-arrow" href="/eventos">
                Ver todas →
              </Link>
            </div>
            <ul className="events" style={{ gridColumn: '5 / span 8' }}>
              {events.docs.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="empty-band">
            <p className="disp disp-800" style={{ fontSize: 22 }}>
              Pronto anunciamos fechas
            </p>
            <Link className="link-arrow" href="/eventos">
              Eventos y booking →
            </Link>
          </div>
        )}
      </section>
    ),

    newsletter: settings.newsletterUrl ? (
      <section key="newsletter" className="band">
        <div className="wrap">
          <h2 className="disp h-l" style={{ maxWidth: 760 }}>
            Avísame del próximo drop
          </h2>
          <a className="btn btn-primary" href={settings.newsletterUrl} target="_blank" rel="noreferrer">
            Suscribirme
          </a>
        </div>
      </section>
    ) : null,
  }

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <Frame
            media={home.heroImage || heroRelease?.cover}
            ratio="r-169"
            size="hero"
            eager
            className=""
            label={home.heroImage || heroRelease?.cover ? undefined : 'Foto provisional'}
          />
        </div>
        <div className="wrap hero-inner">
          {heroRelease ? (
            <>
              <div className="tags">
                <span className="tag tag-solid">{home.heroEyebrow || 'Nuevo lanzamiento'}</span>
                <span className="tag tag-outline">
                  {formatDate(heroRelease.releaseDate)}
                  {heroRelease.catalogNumber ? ` · ${heroRelease.catalogNumber}` : ''}
                </span>
              </div>
              <h1 className="disp hero-title">{heroRelease.title}</h1>
              <div className="hero-foot">
                <p className="disp disp-800 hero-artist">{names(heroRelease)}</p>
                <div className="actions">
                  {isFuture(heroRelease.releaseDate) && heroRelease.presaveUrl ? (
                    <a className="btn btn-primary" href={heroRelease.presaveUrl} target="_blank" rel="noreferrer">
                      Pre-save
                    </a>
                  ) : (
                    <a
                      className="btn btn-primary"
                      href={heroRelease.spotifyUrl || `/lanzamientos/${heroRelease.slug}`}
                      target={heroRelease.spotifyUrl ? '_blank' : undefined}
                      rel="noreferrer"
                    >
                      Escuchar ahora
                    </a>
                  )}
                  <Link className="btn btn-outline" href={home.heroShopUrl || '/tienda'}>
                    Comprar merch
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="disp hero-title">{settings.siteName || 'Lumbre Music'}</h1>
              <div className="actions">
                <Link className="btn btn-primary" href="/artistas">
                  Conoce al roster
                </Link>
                <Link className="btn btn-outline" href="/tienda">
                  Tienda
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      {order.filter((b) => b.visible !== false).map((b) => blocks[b.block] ?? null)}
    </>
  )
}
