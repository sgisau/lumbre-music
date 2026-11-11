import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 96, paddingBottom: 160, display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-start' }}>
      <p className="mono" style={{ color: 'var(--cromo)' }}>
        Error 404
      </p>
      <h1 className="disp" style={{ fontSize: 'clamp(48px, 9vw, 132px)' }}>
        Aquí no hay nada
      </h1>
      <Link className="btn btn-primary" href="/">
        Volver al inicio
      </Link>
    </div>
  )
}
