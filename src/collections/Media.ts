import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen o archivo', plural: 'Medios' },
  admin: {
    group: 'Contenido',
    description: 'Fotos de artistas, portadas, logos y fotos de producto.',
  },
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: { description: 'Describe la imagen en pocas palabras (accesibilidad y Google).' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'card', width: 960 },
      { name: 'hero', width: 2000 },
    ],
  },
}
