/**
 * Carga contenido de DEMOSTRACIÓN para ver el sitio funcionando en local.
 * Todo es provisional ("Artista 01", "Lanzamiento 01"…): no lo uses en producción.
 *
 *   npm run seed:demo
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'artists' })
if (existing.totalDocs > 0) {
  console.log('Ya hay artistas en la base de datos; no se carga la demo.')
  process.exit(0)
}

const day = (offset: number) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offset)
  d.setUTCHours(12, 0, 0, 0)
  return d.toISOString()
}

const artists = []
for (let i = 1; i <= 4; i++) {
  artists.push(
    await payload.create({
      collection: 'artists',
      data: { name: `Artista 0${i}`, order: i, visible: true },
    }),
  )
}

const types = ['single', 'ep', 'single', 'album', 'single'] as const
for (let i = 1; i <= 5; i++) {
  await payload.create({
    collection: 'releases',
    data: {
      title: `Lanzamiento 0${i}`,
      type: types[i - 1],
      releaseDate: day(-i * 20),
      artists: [artists[(i - 1) % artists.length].id],
      tracklist: [{ title: 'Track 01' }, { title: 'Track 02' }, { title: 'Track 03' }],
      _status: 'published',
    },
  })
}

for (let i = 1; i <= 2; i++) {
  await payload.create({
    collection: 'events',
    data: {
      date: day(i * 15),
      city: `Ciudad 0${i}`,
      venue: `Venue 0${i}`,
      artists: [artists[i - 1].id],
      status: i === 2 ? 'soldout' : 'available',
    },
  })
}

for (let i = 1; i <= 4; i++) {
  await payload.create({
    collection: 'products',
    data: {
      title: `Producto 0${i}`,
      artist: artists[(i - 1) % 2].id,
      drop: 'Drop 01',
      order: i,
      badges: i === 1 ? ['limited'] : i === 4 ? ['new'] : [],
      sizes: ['S', 'M', 'L', 'XL'].map((label) => ({ label, available: label !== 'XL' || i !== 1 })),
      fanBenefit:
        i === 2
          ? { enabled: true, type: 'signature', text: '[Texto del beneficio fan: lo escribe Lumbre en el panel]', limit: 30 }
          : { enabled: false },
      visible: true,
    },
  })
}

await payload.updateGlobal({ slug: 'home-page', data: { dropTitle: 'Drop 01' } })

console.log('Demo cargada: 4 artistas, 5 lanzamientos, 2 eventos y 4 productos.')
process.exit(0)
