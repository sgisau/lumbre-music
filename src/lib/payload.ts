import config from '@payload-config'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

export const getPayloadClient = () => getPayload({ config })

export const getSettings = async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

type SizeName = 'thumb' | 'card' | 'hero'

export const asMedia = (value: unknown): Media | null =>
  value && typeof value === 'object' && 'url' in (value as Media) ? (value as Media) : null

/** URL de una imagen, en el tamaño pedido si existe. */
export const mediaUrl = (value: unknown, size?: SizeName): string | null => {
  const media = asMedia(value)
  if (!media) return null
  const sized = size ? media.sizes?.[size]?.url : null
  return sized || media.url || null
}

export const isVideo = (value: unknown): boolean => Boolean(asMedia(value)?.mimeType?.startsWith('video/'))

const TZ = process.env.SITE_TIMEZONE || 'America/Mexico_City'

export const formatDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = {}) => {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', ...opts }).format(
    new Date(iso),
  )
}

/** Partes de la fecha de un evento, en la zona horaria del sitio. */
export const eventDateParts = (iso: string) => {
  const d = new Date(iso)
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-MX', { timeZone: TZ, ...o }).format(d)
  return {
    day: part({ day: '2-digit' }),
    month: part({ month: 'short' }).replace('.', ''),
    year: part({ year: 'numeric' }),
    time: part({ hour: '2-digit', minute: '2-digit', hour12: false }),
    weekday: part({ weekday: 'long' }),
  }
}

export const formatListeners = (n?: number | null, compact = false) => {
  if (n === null || n === undefined) return null
  return new Intl.NumberFormat('es-MX', compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(n)
}

export const formatPrice = (amount?: number | null, currency = 'MXN') => {
  if (amount === null || amount === undefined) return null
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(amount) + ` ${currency}`
}

export const youtubeId = (url?: string | null): string | null => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/** Convierte un enlace de Spotify (artista, álbum, canción) en URL de reproductor embebido. */
export const spotifyEmbed = (url?: string | null): string | null => {
  if (!url) return null
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(artist|album|track|playlist)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : null
}

export const RELEASE_TYPES: Record<string, string> = { single: 'Single', ep: 'EP', album: 'Álbum', mixtape: 'Mixtape' }

export const EVENT_STATUS: Record<string, string> = {
  available: 'Boletos',
  few: 'Pocos boletos',
  soldout: 'Agotado',
  cancelled: 'Cancelado',
}

export const BADGES: Record<string, string> = { new: 'Nuevo', limited: 'Edición limitada', soldout: 'Agotado' }

export const yearOf = (iso?: string | null) => (iso ? new Date(iso).getUTCFullYear() : null)

export const isFuture = (iso?: string | null) => Boolean(iso && new Date(iso).getTime() > Date.now())
