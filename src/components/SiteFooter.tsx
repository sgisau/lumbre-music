import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { mediaUrl } from '@/lib/payload'

export function SiteFooter({ settings }: { settings: SiteSetting }) {
  const logo = mediaUrl(settings.logo)
  const name = settings.siteName || 'Lumbre Music'
  const year = new Date().getFullYear()
  return (
    <footer className="wrap site-footer">
      <div className="footer-cols">
        <div className="footer-brand">
          {logo ? <img src={logo} alt={name} /> : <span className="disp" style={{ fontSize: 72 }}>{name.replace(/ music$/i, '')}</span>}
          {settings.tagline ? <p className="mono quiet">{settings.tagline}</p> : null}
        </div>
        <nav className="footer-nav mono" aria-label="Pie">
          <Link href="/artistas">Artistas</Link>
          <Link href="/lanzamientos">Lanzamientos</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/eventos">Eventos</Link>
          <Link href="/tienda">Tienda</Link>
          <Link href="/nosotros">Nosotros</Link>
        </nav>
        <nav className="footer-nav mono" aria-label="Ayuda">
          <Link href="/contacto">Contacto y booking</Link>
          <Link href="/tienda#envios">Envíos</Link>
          <Link href="/tienda#devoluciones">Cambios y devoluciones</Link>
          {(settings.socials || []).map((s) => (
            <a key={s.id || s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom mono">
        <span>
          © {year} {name}
        </span>
        <Link href="/admin">Acceso administradores</Link>
      </div>
    </footer>
  )
}
