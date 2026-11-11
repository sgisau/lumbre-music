import type { CollectionConfig } from 'payload'

import { hasRole, ROLES, superadminField } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Administrador', plural: 'Administradores' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Configuración',
    description: 'Personas con acceso al panel. Solo el superadministrador puede crear usuarios y cambiar roles.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    // El primer usuario se crea desde la pantalla de bienvenida del panel.
    create: ({ req }) => hasRole(req.user as never),
    read: ({ req }) => {
      if (hasRole(req.user as never)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => {
      if (hasRole(req.user as never)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => hasRole(req.user as never),
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.role = 'superadmin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      defaultValue: 'contenido',
      options: ROLES.map((r) => ({ label: r.label, value: r.value })),
      saveToJWT: true,
      access: { create: superadminField, update: superadminField },
      admin: {
        description:
          'Superadministrador: todo. Contenido: artistas, lanzamientos, videos, home y ajustes. Tienda: productos. Eventos: fechas.',
      },
    },
  ],
}
