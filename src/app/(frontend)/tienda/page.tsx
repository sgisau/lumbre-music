import type { Metadata } from 'next'
import Link from 'next/link'
import type { Where } from 'payload'

import { ProductCard } from '@/components/cards'
import { RichText } from '@/components/RichText'
import { getPayloadClient, getSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Tienda' }

type Props = { searchParams: Promise<{ artista?: string }> }

export default async function ShopPage({ searchParams }: Props) {
  const { artista } = await searchParams
  const payload = await getPayloadClient()
  const [artists, settings] = await Promise.all([
    payload.find({ collection: 'artists', where: { visible: { equals: true } }, sort: 'order', limit: 100, depth: 0 }),
    getSettings(),
  ])
  const selected = artists.docs.find((a) => a.slug === artista)
  const where: Where = { visible: { equals: true } }
  if (selected) where.artist = { equals: selected.id }
  const products = await payload.find({ collection: 'products', where, sort: 'order', limit: 120, depth: 1 })

  const all = await payload.find({ collection: 'products', where: { visible: { equals: true } }, limit: 500, depth: 0, select: { artist: true } })
  const artistIds = new Set(all.docs.map((p) => (typeof p.artist === 'object' ? p.artist?.id : p.artist)).filter(Boolean))
  const withMerch = artists.docs.filter((a) => artistIds.has(a.id))

  return (
    <>
      <div className="light">
        <div className="wrap" style={{ paddingBottom: 104 }}>
          <header className="page-head">
            <p className="mono muted" style={{ marginBottom: 16 }}>
              Merch oficial
            </p>
            <h1 className="disp">Tienda</h1>
          </header>
          {withMerch.length > 1 ? (
            <nav className="filters" aria-label="Filtrar por artista">
              <Link className="chip" href="/tienda" aria-current={!selected ? 'true' : undefined} style={{ borderColor: 'var(--hueso-linea)' }}>
                Todo
              </Link>
              {withMerch.map((a) => (
                <Link
                  key={a.id}
                  className="chip"
                  href={`/tienda?artista=${a.slug}`}
                  aria-current={selected?.id === a.id ? 'true' : undefined}
                  style={{ borderColor: 'var(--hueso-linea)' }}
                >
                  {a.name}
                </Link>
              ))}
            </nav>
          ) : null}
          {products.docs.length ? (
            <div className="grid g-4">
              {products.docs.map((p) => (
                <ProductCard key={p.id} product={p} light />
              ))}
            </div>
          ) : (
            <p className="empty mono" style={{ borderColor: 'var(--hueso-linea)', color: 'var(--ceniza-claro)' }}>
              Aún no hay productos publicados.
            </p>
          )}
        </div>
      </div>
      {settings.shippingPolicy || settings.returnsPolicy ? (
        <section className="wrap section g-12">
          {settings.shippingPolicy ? (
            <div id="envios" style={{ gridColumn: 'span 6' }}>
              <h2 className="disp h-m" style={{ marginBottom: 20 }}>
                Envíos
              </h2>
              <RichText data={settings.shippingPolicy} />
            </div>
          ) : null}
          {settings.returnsPolicy ? (
            <div id="devoluciones" style={{ gridColumn: 'span 6' }}>
              <h2 className="disp h-m" style={{ marginBottom: 20 }}>
                Cambios y devoluciones
              </h2>
              <RichText data={settings.returnsPolicy} />
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  )
}
