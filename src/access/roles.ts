import type { Access, FieldAccess } from 'payload'

export const ROLES = [
  { label: 'Superadministrador', value: 'superadmin' },
  { label: 'Contenido', value: 'contenido' },
  { label: 'Tienda', value: 'tienda' },
  { label: 'Eventos', value: 'eventos' },
] as const

export type Role = (typeof ROLES)[number]['value']

type MaybeUser = { role?: Role | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user && user.role && (user.role === 'superadmin' || roles.includes(user.role)))

/** Lectura pública. */
export const anyone: Access = () => true

/** Cualquier administrador con sesión. */
export const loggedIn: Access = ({ req }) => Boolean(req.user)

/** Solo los roles indicados (el superadmin siempre pasa). */
export const roles =
  (...allowed: Role[]): Access =>
  ({ req }) =>
    hasRole(req.user as MaybeUser, ...allowed)

export const superadminField: FieldAccess = ({ req }) => hasRole(req.user as MaybeUser)

/**
 * Lectura pública solo de lo publicado; quien tiene sesión ve también borradores.
 */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
