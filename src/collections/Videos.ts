import type { CollectionConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'artists', 'publishedAt', 'featured'],
    group: 'Contenido',
    description: 'Videos de YouTube (horizontales) y clips verticales. Pega el enlace de YouTube.',
  },
  defaultSort: '-publishedAt',
  access: {
    read: anyone,
    create: roles('contenido'),
    update: roles('contenido'),
    delete: roles('contenido'),
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'youtubeUrl',
      label: 'Enlace de YouTube',
      type: 'text',
      required: true,
      admin: { description: 'Funciona con enlaces de video, de youtu.be y de Shorts.' },
      validate: (value: unknown) =>
        typeof value === 'string' && /(youtube\.com|youtu\.be)/.test(value)
          ? true
          : 'Pega un enlace de YouTube válido.',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          label: 'Formato',
          type: 'select',
          defaultValue: 'video',
          required: true,
          options: [
            { label: 'Video (horizontal)', value: 'video' },
            { label: 'Clip (vertical)', value: 'clip' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'publishedAt',
          label: 'Fecha',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
      ],
    },
    { name: 'artists', label: 'Artistas', type: 'relationship', relationTo: 'artists', hasMany: true },
    { name: 'release', label: 'Lanzamiento relacionado', type: 'relationship', relationTo: 'releases' },
    {
      name: 'featured',
      label: 'Destacado en la home',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
