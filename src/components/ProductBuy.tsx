'use client'

import { useState } from 'react'

type Size = { label: string; available?: boolean | null }

export function ProductBuy({ sizes, buyUrl, price, soldOut }: { sizes: Size[]; buyUrl?: string | null; price: string | null; soldOut: boolean }) {
  const firstAvailable = sizes.find((s) => s.available !== false)?.label ?? null
  const [size, setSize] = useState<string | null>(sizes.length ? firstAvailable : null)

  const link = buyUrl && !soldOut ? buyUrl : null
  const label = soldOut ? 'Agotado' : link ? 'Comprar' : 'Próximamente'

  const cta = (cls: string) =>
    link ? (
      <a className={`btn btn-primary ${cls}`} href={link} target="_blank" rel="noreferrer">
        {label}
        {size ? ` · ${size}` : ''}
      </a>
    ) : (
      <span className={`btn btn-primary ${cls}`} aria-disabled="true">
        {label}
      </span>
    )

  return (
    <>
      {sizes.length ? (
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <legend className="mono" style={{ color: 'var(--cromo)', marginBottom: 12 }}>
            Talla{size ? `: ${size}` : ''}
          </legend>
          <div className="sizes">
            {sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                className="size"
                aria-pressed={size === s.label}
                disabled={s.available === false}
                onClick={() => setSize(s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cta('btn-block')}
        {!link && !soldOut ? (
          <p className="mono quiet" style={{ fontSize: 10, textAlign: 'center' }}>
            La compra en línea se activa al conectar la tienda
          </p>
        ) : null}
      </div>
      <div className="buy-bar">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 96 }}>
          {size ? <span className="mono quiet" style={{ fontSize: 9 }}>Talla {size}</span> : null}
          <span className="mono" style={{ fontSize: 14 }}>{price || ''}</span>
        </div>
        {cta('')}
      </div>
    </>
  )
}
