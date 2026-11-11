import type { Metadata } from 'next'

import { getSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Contacto' }

export default async function ContactPage() {
  const s = await getSettings()
  const rows = [
    { label: 'Booking', email: s.bookingEmail, text: 'Contrataciones y shows de nuestros artistas.' },
    { label: 'Prensa', email: s.pressEmail, text: 'Entrevistas, material de prensa y acreditaciones.' },
    { label: 'General', email: s.contactEmail, text: 'Tienda, colaboraciones y todo lo demás.' },
    { label: 'Demos', email: s.demosEmail, text: 'Envía un enlace a tu música (no adjuntos pesados).' },
  ].filter((r) => r.email)

  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head">
        <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 16 }}>
          Escríbenos
        </p>
        <h1 className="disp">Contacto</h1>
      </header>
      {rows.length ? (
        <ul className="events">
          {rows.map((r) => (
            <li key={r.label} className="event" style={{ gridTemplateColumns: '200px 1fr auto' }}>
              <span className="disp disp-800" style={{ fontSize: 24 }}>
                {r.label}
              </span>
              <span className="muted">{r.text}</span>
              <a className="btn btn-outline" href={`mailto:${r.email}`}>
                {r.email}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty mono">Los correos de contacto se configuran en el panel: Ajustes del sitio → Redes y contacto.</p>
      )}
      {s.socials?.length ? (
        <div className="actions" style={{ marginTop: 48 }}>
          {s.socials.map((x) => (
            <a key={x.id || x.url} className="btn btn-outline" href={x.url} target="_blank" rel="noreferrer">
              {x.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
