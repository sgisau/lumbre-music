import type { GlobalConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'Página Nosotros',
  admin: { group: 'Contenido' },
  access: {
    read: anyone,
    update: roles('contenido'),
  },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Nosotros' },
    { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Texto', type: 'richText' },
  ],
}
