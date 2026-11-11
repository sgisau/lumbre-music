'use client'

import { useState } from 'react'

/**
 * Muestra la miniatura de YouTube y carga el reproductor solo al hacer clic,
 * para que la página no cargue decenas de iframes de golpe.
 */
export function VideoPlayer({ id, title, vertical = false, big = false }: { id: string; title: string; vertical?: boolean; big?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const ratio = vertical ? 'r-916' : 'r-169'
  if (playing) {
    return (
      <iframe
        className={`video-frame ${ratio}`}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  return (
    <button type="button" className="video-btn" onClick={() => setPlaying(true)} aria-label={`Reproducir: ${title}`}>
      <div className={`ph ${ratio}`}>
        <img src={`https://i.ytimg.com/vi/${id}/${vertical ? 'hq720' : 'maxresdefault'}.jpg`} alt="" loading="lazy" onError={(e) => {
          const img = e.currentTarget
          if (!img.dataset.fallback) {
            img.dataset.fallback = '1'
            img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
          }
        }} />
        <span className="play" aria-hidden="true" style={big ? undefined : { width: 56, height: 56, margin: '-28px 0 0 -28px' }}>
          <svg width={big ? 26 : 20} height={big ? 26 : 20} viewBox="0 0 24 24" fill="#F2EFEA">
            <path d="M7 4l13 8-13 8z" />
          </svg>
        </span>
      </div>
    </button>
  )
}
