import type { GlobalConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

export const HOME_BLOCKS = [
  { label: 'Lanzamiento destacado', value: 'featured' },
  { label: 'Roster de artistas', value: 'roster' },
  { label: 'Últimos lanzamientos', value: 'releases' },
  { label: 'Drop de tienda', value: 'drop' },
  { label: 'Videos y clips', value: 'videos' },
  { label: 'Próximas fechas', value: 'events' },
  { label: 'Newsletter', value: 'newsletter' },
] as const

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Página de inicio',
  admin: {
    group: 'Contenido',
    description: 'Qué se ve en la home y en qué orden.',
  },
  access: {
    read: anyone,
    update: roles('contenido', 'tienda'),
  },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Portada (hero)',
          fields: [
            {
              name: 'heroRelease',
              label: 'Lanzamiento del momento',
              type: 'relationship',
              relationTo: 'releases',
              admin: { description: 'Vacío = el lanzamiento publicado más reciente.' },
            },
            {
              name: 'heroImage',
              label: 'Imagen o video de fondo',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Horizontal. Vacío = la portada del lanzamiento.' },
            },
            { name: 'heroEyebrow', label: 'Etiqueta superior', type: 'text', defaultValue: 'Nuevo lanzamiento' },
            {
              name: 'heroShopUrl',
              label: 'Enlace del botón “Comprar merch”',
              type: 'text',
              defaultValue: '/tienda',
            },
          ],
        },
        {
          label: 'Destacados',
          fields: [
            {
              name: 'featuredRelease',
              label: 'Lanzamiento destacado (bloque blanco)',
              type: 'relationship',
              relationTo: 'releases',
              admin: { description: 'Vacío = el mismo de la portada.' },
            },
            {
              name: 'dropTitle',
              label: 'Nombre del drop',
              type: 'text',
              admin: { description: 'Título del bloque de tienda.' },
            },
            {
              name: 'dropProducts',
              label: 'Productos del drop',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              maxRows: 8,
              admin: { description: 'Vacío = los primeros productos visibles.' },
            },
          ],
        },
        {
          label: 'Orden de bloques',
          fields: [
            {
              name: 'blocks',
              label: 'Bloques de la home',
              type: 'array',
              labels: { singular: 'Bloque', plural: 'Bloques' },
              admin: { description: 'Arrastra para cambiar el orden. Desmarca “Visible” para ocultar un bloque.' },
              defaultValue: HOME_BLOCKS.map((b) => ({ block: b.value, visible: true })),
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'block',
                      label: 'Bloque',
                      type: 'select',
                      required: true,
                      options: HOME_BLOCKS.map((b) => ({ label: b.label, value: b.value })),
                      admin: { width: '70%' },
                    },
                    { name: 'visible', label: 'Visible', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
