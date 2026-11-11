import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BADGES, formatPrice, getPayloadClient, getSettings, mediaUrl } from '@/lib/payload'
import { Frame, ProductCard } from '@/components/cards'
import { ProductBuy } from '@/components/ProductBuy'
import { RichText } from '@/components/RichText'

type Props = { params: Promise<{ slug: string }> }

const getProduct = async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'products', where: { slug: { equals: slug }, visible: { equals: true } }, limit: 1, depth: 1 })
  return res.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug)
  if (!p) return {}
  const img = mediaUrl(p.images?.[0], 'hero')
  return { title: p.title, openGraph: img ? { images: [img] } : undefined }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug)
  if (!product) notFound()

  const payload = await getPayloadClient()
  const settings = await getSettings()
  const artist = typeof product.artist === 'object' ? product.artist : null
  const related = await payload.find({
    collection: 'products',
    where: {
      id: { not_equals: product.id },
      visible: { equals: true },
      ...(product.drop ? { drop: { equals: product.drop } } : artist ? { artist: { equals: artist.id } } : {}),
    },
    sort: 'order',
    limit: 4,
    depth: 1,
  })

  const images = product.images?.length ? product.images : [null, null, null]
  const price = formatPrice(product.price, product.currency || 'MXN')
  const soldOut = (product.badges || []).includes('soldout')
  const fan = product.fanBenefit

  return (
    <>
      <div className="wrap breadcrumbs mono">
        <Link href="/tienda">Tienda</Link>
        {product.drop ? <> / {product.drop}</> : null} / {product.title}
      </div>
      <section className="wrap product">
        <div className="product-gallery">
          {images.map((img, i) => (
            <Frame
              key={typeof img === 'object' && img ? img.id : i}
              media={img}
              ratio="r-45"
              size={i === 0 ? 'hero' : 'card'}
              light
              eager={i === 0}
              label={img ? undefined : 'Foto provisional'}
            />
          ))}
        </div>
        <div className="product-info">
          <div className="tags">
            {(product.badges || []).map((b) => (
              <span key={b} className="tag tag-solid">
                {BADGES[b]}
              </span>
            ))}
            {product.drop ? <span className="tag tag-outline">{product.drop}</span> : null}
          </div>
          <h1 className="disp" style={{ fontSize: 'clamp(34px, 4vw, 56px)' }}>
            {product.title}
          </h1>
          {artist ? (
            <Link href={`/artistas/${artist.slug}`} className="mono" style={{ color: 'var(--cromo)' }}>
              {artist.name} →
            </Link>
          ) : null}
          <p className="price">
            {price || 'Precio próximamente'}
            {product.compareAtPrice && price ? <s>{formatPrice(product.compareAtPrice, product.currency || 'MXN')}</s> : null}
          </p>

          {fan?.enabled && fan.text ? (
            <div className="fan">
              <p className="mono" style={{ color: 'var(--cromo)', fontSize: 11 }}>
                Beneficio fan
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.5 }}>{fan.text}</p>
              {fan.limit ? (
                <p className="mono quiet" style={{ fontSize: 11 }}>
                  Para las primeras {fan.limit} compras
                </p>
              ) : null}
            </div>
          ) : null}

          <ProductBuy sizes={(product.sizes || []).map((s) => ({ label: s.label, available: s.available }))} buyUrl={product.buyUrl} price={price} soldOut={soldOut} />

          <div className="acc">
            {product.description ? (
              <details open>
                <summary>Descripción</summary>
                <div className="acc-body">
                  <RichText data={product.description} className="" />
                </div>
              </details>
            ) : null}
            {settings.shippingPolicy ? (
              <details>
                <summary>Envíos</summary>
                <div className="acc-body">
                  <RichText data={settings.shippingPolicy} className="" />
                </div>
              </details>
            ) : null}
            {settings.returnsPolicy ? (
              <details>
                <summary>Cambios y devoluciones</summary>
                <div className="acc-body">
                  <RichText data={settings.returnsPolicy} className="" />
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </section>

      {related.docs.length ? (
        <section className="wrap section-tight">
          <div className="sec-head rule-top">
            <h2 className="disp h-m">{product.drop ? 'Del mismo drop' : 'También te puede gustar'}</h2>
            <Link className="link-arrow" href="/tienda">
              Tienda →
            </Link>
          </div>
          <div className="grid g-4">
            {related.docs.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
