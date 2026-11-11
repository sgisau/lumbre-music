'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  logoUrl: string | null
  logoAlt: string
  siteName: string
}

const LEFT = [
  { href: '/artistas', label: 'Artistas' },
  { href: '/lanzamientos', label: 'Lanzamientos' },
  { href: '/videos', label: 'Videos' },
]
const RIGHT = [
  { href: '/eventos', label: 'Eventos' },
  { href: '/contacto', label: 'Contacto' },
]

export function SiteHeader({ logoUrl, logoAlt, siteName }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const current = (href: string) => (pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined)

  const logo = (
    <Link href="/" className="logo" aria-label={`${siteName}, inicio`}>
      {logoUrl ? <img src={logoUrl} alt={logoAlt} /> : <span className="logo-text">{siteName.replace(/ music$/i, '')}</span>}
    </Link>
  )

  return (
    <header className="site-header">
      <div className="wrap">
        <button
          type="button"
          className="menu-btn"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
        <nav className="nav" aria-label="Principal">
          {LEFT.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        {logo}
        <nav className="nav nav-right" aria-label="Secundario">
          {RIGHT.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
          <Link href="/tienda" className="nav-shop" aria-current={current('/tienda')}>
            Tienda
          </Link>
        </nav>
        <Link href="/tienda" className="cart-btn" aria-label="Tienda">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 8h14l-1 12H6z" />
            <path d="M9 8V6a3 3 0 016 0v2" />
          </svg>
        </Link>
      </div>
      <nav id="menu-movil" className="mobile-menu" data-open={open} aria-label="Menú móvil">
        {[...LEFT, ...RIGHT, { href: '/tienda', label: 'Tienda' }].map((l) => (
          <Link key={l.href} href={l.href} aria-current={current(l.href)}>
            {l.label}
          </Link>
        ))}
        <div className="mobile-small">
          <Link href="/nosotros">Nosotros</Link>
        </div>
      </nav>
    </header>
  )
}
