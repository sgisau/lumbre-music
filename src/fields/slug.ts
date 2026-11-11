import type { Field } from 'payload'

export const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Campo de URL amigable. Se rellena solo a partir de `fromField` si se deja vacío.
 */
export const slugField = (fromField: string): Field => ({
  name: 'slug',
  label: 'URL (slug)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Se genera solo a partir del nombre. Cámbialo solo si sabes lo que haces.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return toSlug(value)
        const source = data?.[fromField]
        return typeof source === 'string' ? toSlug(source) : value
      },
    ],
  },
})
