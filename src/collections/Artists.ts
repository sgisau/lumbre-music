import type { CollectionConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Artists: CollectionConfig = {
  slug: 'artists',
  labels: { singular: 'Artista', plural: 'Artistas' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'monthlyListeners', 'listenersUpdatedAt', 'visible', 'order'],
    group: 'Contenido',
    description: 'Roster firmado. El orden decide cómo aparecen en el sitio (menor número primero).',
    listSearchableFields: ['name'],
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: roles('contenido'),
    update: roles('contenido'),
    delete: roles('contenido'),
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const changed = data.monthlyListeners !== undefined && data.monthlyListeners !== originalDoc?.monthlyListeners
        const dateTouched = data.listenersUpdatedAt && data.listenersUpdatedAt !== originalDoc?.listenersUpdatedAt
        if (changed && !dateTouched) data.listenersUpdatedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Perfil',
          fields: [
            { name: 'name', label: 'Nombre artístico', type: 'text', required: true },
            {
              name: 'photo',
              label: 'Foto de tarjeta (vertical 4:5)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Se usa en la grilla de artistas.' },
            },
            {
              name: 'headerPhoto',
              label: 'Foto de cabecera (horizontal)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Opcional. Si no hay, se usa la foto de tarjeta.' },
            },
            { name: 'bio', label: 'Biografía', type: 'richText' },
          ],
        },
        {
          label: 'Oyentes',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'monthlyListeners',
                  label: 'Oyentes mensuales',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%', description: 'Cifra de Spotify. Déjalo vacío para no mostrarla.' },
                },
                {
                  name: 'listenersUpdatedAt',
                  label: 'Actualizado el',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    description: 'Se pone solo al cambiar la cifra.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Enlaces',
          fields: [
            { name: 'spotifyUrl', label: 'Spotify (perfil del artista)', type: 'text' },
            { name: 'appleMusicUrl', label: 'Apple Music', type: 'text' },
            { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
            {
              name: 'socials',
              label: 'Redes sociales',
              type: 'array',
              labels: { singular: 'Red', plural: 'Redes' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Nombre (Instagram, TikTok…)', type: 'text', required: true },
                    { name: 'url', label: 'Enlace', type: 'text', required: true },
                  ],
                },
              ],
            },
            { name: 'bookingEmail', label: 'Correo de booking', type: 'email' },
          ],
        },
      ],
    },
    slugField('name'),
    {
      name: 'visible',
      label: 'Visible en el sitio',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: 'Orden',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Menor número aparece primero.' },
    },
  ],
}
