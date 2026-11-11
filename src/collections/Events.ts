import type { CollectionConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['date', 'city', 'venue', 'artists', 'status'],
    group: 'Contenido',
    description: 'Conciertos y fechas. Las fechas pasadas se ocultan solas del sitio.',
  },
  defaultSort: 'date',
  access: {
    read: anyone,
    create: roles('contenido', 'eventos'),
    update: roles('contenido', 'eventos'),
    delete: roles('contenido', 'eventos'),
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'date',
      label: 'Fecha y hora',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'city', label: 'Ciudad', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'country', label: 'País', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'venue', label: 'Lugar (venue)', type: 'text' },
    { name: 'artists', label: 'Artistas', type: 'relationship', relationTo: 'artists', hasMany: true },
    { name: 'ticketUrl', label: 'Enlace de boletos', type: 'text' },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      defaultValue: 'available',
      required: true,
      options: [
        { label: 'Boletos disponibles', value: 'available' },
        { label: 'Pocos boletos', value: 'few' },
        { label: 'Agotado', value: 'soldout' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
