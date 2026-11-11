import type { CollectionConfig } from 'payload'

import { publishedOrLoggedIn, roles } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Releases: CollectionConfig = {
  slug: 'releases',
  labels: { singular: 'Lanzamiento', plural: 'Lanzamientos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'artists', 'type', 'releaseDate', '_status'],
    group: 'Contenido',
    description: 'Sencillos, EPs y álbumes. Puedes dejarlos en borrador o programar su publicación.',
  },
  defaultSort: '-releaseDate',
  versions: {
    drafts: { schedulePublish: true },
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrLoggedIn,
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
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Tipo',
          type: 'select',
          required: true,
          defaultValue: 'single',
          options: [
            { label: 'Single', value: 'single' },
            { label: 'EP', value: 'ep' },
            { label: 'Álbum', value: 'album' },
            { label: 'Mixtape', value: 'mixtape' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'releaseDate',
          label: 'Fecha de salida',
          type: 'date',
          required: true,
          admin: { width: '33%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
        {
          name: 'catalogNumber',
          label: 'Número de catálogo',
          type: 'text',
          admin: { width: '33%', description: 'Opcional, p. ej. LBR-001.' },
        },
      ],
    },
    {
      name: 'artists',
      label: 'Artistas',
      type: 'relationship',
      relationTo: 'artists',
      hasMany: true,
      required: true,
    },
    { name: 'cover', label: 'Portada (cuadrada)', type: 'upload', relationTo: 'media' },
    {
      name: 'tracklist',
      label: 'Lista de canciones',
      type: 'array',
      labels: { singular: 'Canción', plural: 'Canciones' },
      fields: [{ name: 'title', label: 'Título', type: 'text', required: true }],
    },
    {
      type: 'collapsible',
      label: 'Enlaces a plataformas',
      fields: [
        { name: 'spotifyUrl', label: 'Spotify', type: 'text' },
        { name: 'appleMusicUrl', label: 'Apple Music', type: 'text' },
        { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
        {
          name: 'otherLinks',
          label: 'Otras plataformas',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Plataforma', type: 'text', required: true },
                { name: 'url', label: 'Enlace', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          name: 'presaveUrl',
          label: 'Enlace de pre-save',
          type: 'text',
          admin: { description: 'Se muestra mientras la fecha de salida no haya llegado.' },
        },
      ],
    },
    { name: 'credits', label: 'Créditos', type: 'textarea' },
    slugField('title'),
  ],
}
