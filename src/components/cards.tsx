import Link from 'next/link'

import type { Artist, Event, Product, Release } from '@/payload-types'
import {
  BADGES,
  EVENT_STATUS,
  eventDateParts,
  formatListeners,
  formatPrice,
  isVideo,
  mediaUrl,
  RELEASE_TYPES,
  yearOf,
} from '@/lib/payload'

type Ratio = 'r-45' | 'r-11' | 'r-169' | 'r-916'

/** Imagen con fondo de medios tonos; si no hay archivo, muestra el marcador provisional. */
export function Frame({
  media,
  ratio,
  size = 'card',
  light = false,
  label,
  className = '',
  eager = false,
}: {
  media: unknown
  ratio: Ratio
  size?: 'thumb' | 'card' | 'hero'
  light?: boolean
  label?: string
  className?: string
  eager?: boolean
}) {
  const url = mediaUrl(media, size)
  const alt = media && typeof media === 'object' && 'alt' in media ? String((media as { alt?: string }).alt || '') : ''
  return (
    <div className={`ph ${light ? 'ph-light' : ''} ${ratio} ${className}`}>
      {url ? (
        isVideo(media) ? (
          <video src={url} autoPlay muted loop playsInline aria-hidden="true" />
        ) : (
          <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} />
        )
      ) : label ? (
        <span className="ph-label">{label}</span>
      ) : null}
    </div>
  )
}

const artistNames = (artists: Release['artists'] | undefined) =>
  (artists || [])
    .map((a) => (typeof a === 'object' ? a.name : null))
    .filter(Boolean)
    .join(', ')

export function ArtistCard({ artist }: { artist: Artist }) {
  const listeners = formatListeners(artist.monthlyListeners, true)
  return (
    <Link href={`/artistas/${artist.slug}`} className="ph r-45 artist-card card-media">
      {mediaUrl(artist.photo, 'card') ? (
        <img src={mediaUrl(artist.photo, 'card')!} alt="" loading="lazy" />
      ) : (
        <span className="mono quiet" style={{ position: 'absolute', top: 16, left: 16, fontSize: 10 }}>
          Foto provisional
        </span>
      )}
      {listeners ? <span className="tag tag-outline">{listeners} oyentes mensuales</span> : null}
      <span className="disp">{artist.name}</span>
    </Link>
  )
}

export function ReleaseCard({ release, showArtist = true }: { release: Release; showArtist?: boolean }) {
  const meta = [RELEASE_TYPES[release.type] || release.type, release.catalogNumber || yearOf(release.releaseDate)]
    .filter(Boolean)
    .join(' · ')
  return (
    <Link href={`/lanzamientos/${release.slug}`} className="card">
      <Frame media={release.cover} ratio="r-11" className="card-media" />
      <span className="mono" style={{ fontSize: 10, color: 'var(--cromo)' }}>
        {meta}
      </span>
      <span className="card-title">{release.title}</span>
      {showArtist ? <span className="card-sub">{artistNames(release.artists)}</span> : null}
    </Link>
  )
}

export function ProductCard({ product, light = false }: { product: Product; light?: boolean }) {
  const first = product.images?.[0]
  const price = formatPrice(product.price, product.currency || 'MXN')
  return (
    <Link href={`/tienda/${product.slug}`} className="card">
      <div style={{ position: 'relative' }}>
        <Frame media={first} ratio="r-45" light className="card-media" label={first ? undefined : 'Foto provisional'} />
        <div className="tags" style={{ position: 'absolute', top: 12, left: 12 }}>
          {(product.badges || []).map((b) => (
            <span key={b} className="tag tag-solid" style={{ background: 'var(--negro)', color: 'var(--cromo)', fontSize: 10 }}>
              {BADGES[b]}
            </span>
          ))}
          {product.fanBenefit?.enabled ? (
            <span className="tag tag-dashed" style={{ fontSize: 10, color: light ? 'var(--negro)' : 'var(--cromo)', background: light ? 'transparent' : 'var(--negro)' }}>
              Beneficio fan
            </span>
          ) : null}
        </div>
      </div>
      <span className="card-title">{product.title}</span>
      <span className="mono" style={{ fontSize: 13 }}>
        {price || 'Precio próximamente'}
        {product.compareAtPrice && price ? (
          <s style={{ marginLeft: 8, color: 'var(--ceniza)' }}>{formatPrice(product.compareAtPrice, product.currency || 'MXN')}</s>
        ) : null}
      </span>
    </Link>
  )
}

export function EventRow({ event }: { event: Event }) {
  const d = eventDateParts(event.date)
  const names = (event.artists || [])
    .map((a) => (typeof a === 'object' ? a.name : null))
    .filter(Boolean)
    .join(', ')
  const status = event.status || 'available'
  return (
    <li className="event">
      <div className="stamp" aria-hidden="true">
        <span className="disp">{d.day}</span>
        <span className="mono">{d.month}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="disp disp-800 event-city">
          {event.city}
          {event.country ? `, ${event.country}` : ''}
        </span>
        <span className="mono muted">
          <span className="sr-only">
            {d.weekday} {d.day} de {d.month} de {d.year},{' '}
          </span>
          {[event.venue, d.time, names].filter(Boolean).join(' · ')}
        </span>
      </div>
      {status === 'soldout' || status === 'cancelled' ? (
        <span className="tag tag-solid">{EVENT_STATUS[status]}</span>
      ) : event.ticketUrl ? (
        <a className="btn btn-outline" href={event.ticketUrl} target="_blank" rel="noreferrer">
          {EVENT_STATUS[status]}
        </a>
      ) : (
        <span className="tag tag-outline">Boletos próximamente</span>
      )}
    </li>
  )
}
