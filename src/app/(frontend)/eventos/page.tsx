import type { Metadata } from 'next'

import { EventRow } from '@/components/cards'
import { getPayloadClient, getSettings } from '@/lib/payload'

export const metadata: Metadata = { title: 'Eventos' }

export default async function EventsPage() {
  const payload = await getPayloadClient()
  const [events, settings] = await Promise.all([
    payload.find({ collection: 'events', where: { date: { greater_than_equal: new Date().toISOString() } }, sort: 'date', limit: 100, depth: 1 }),
    getSettings(),
  ])
  const instagram = (settings.socials || []).find((s) => /instagram/i.test(s.label))
  return (
    <div className="wrap" style={{ paddingBottom: 112 }}>
      <header className="page-head">
        <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 16 }}>
          En vivo
        </p>
        <h1 className="disp">Próximas fechas</h1>
      </header>
      {events.docs.length ? (
        <ul className="events">
          {events.docs.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      ) : (
        <div className="empty-band">
          <p className="disp disp-800" style={{ fontSize: 22 }}>
            Pronto anunciamos fechas
          </p>
          {instagram ? (
            <a className="btn btn-outline" href={instagram.url} target="_blank" rel="noreferrer">
              Síguenos en {instagram.label}
            </a>
          ) : null}
        </div>
      )}
      {settings.bookingEmail ? (
        <section className="empty-band" style={{ marginTop: 56 }}>
          <div>
            <p className="mono" style={{ color: 'var(--cromo)', marginBottom: 8 }}>
              Booking
            </p>
            <p className="disp disp-800" style={{ fontSize: 28 }}>
              Contrataciones
            </p>
          </div>
          <a className="btn btn-outline" href={`mailto:${settings.bookingEmail}`}>
            {settings.bookingEmail}
          </a>
        </section>
      ) : null}
    </div>
  )
}
