import type { CollectionConfig } from 'payload'

import { roles } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Producto', plural: 'Productos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'artist', 'price', 'visible'],
    group: 'Tienda',
    description:
      'Merch que se muestra en el sitio. Cuando Shopify esté conectado, precio, stock y pago vendrán de Shopify; aquí quedan las fotos, el beneficio fan y lo que se destaca.',
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (req.user ? true : { visible: { equals: true } }),
    create: roles('tienda'),
    update: roles('tienda'),
    delete: roles('tienda'),
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Nombre', type: 'text', required: true },
    {
      name: 'images',
      label: 'Fotos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'La primera es la principal. Recomendado: una plana y una puesta.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Precio',
          type: 'number',
          min: 0,
          admin: { width: '33%' },
        },
        {
          name: 'compareAtPrice',
          label: 'Precio antes (oferta)',
          type: 'number',
          min: 0,
          admin: { width: '33%', description: 'Opcional. Muestra el precio tachado.' },
        },
        {
          name: 'currency',
          label: 'Moneda',
          type: 'text',
          defaultValue: 'MXN',
          admin: { width: '33%' },
        },
      ],
    },
    { name: 'artist', label: 'Artista', type: 'relationship', relationTo: 'artists' },
    { name: 'drop', label: 'Drop o colección', type: 'text', admin: { description: 'P. ej. “Drop 01”.' } },
    {
      name: 'badges',
      label: 'Etiquetas',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Nuevo', value: 'new' },
        { label: 'Edición limitada', value: 'limited' },
        { label: 'Agotado', value: 'soldout' },
      ],
    },
    {
      name: 'sizes',
      label: 'Tallas',
      type: 'array',
      labels: { singular: 'Talla', plural: 'Tallas' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Talla', type: 'text', required: true },
            { name: 'available', label: 'Disponible', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
    { name: 'description', label: 'Descripción', type: 'richText' },
    {
      name: 'fanBenefit',
      label: 'Beneficio fan',
      type: 'group',
      admin: { description: 'Opcional. Actívalo solo en los productos que lo tengan.' },
      fields: [
        { name: 'enabled', label: 'Activar beneficio fan en este producto', type: 'checkbox', defaultValue: false },
        {
          name: 'type',
          label: 'Tipo',
          type: 'select',
          options: [
            { label: 'Firma del artista', value: 'signature' },
            { label: 'Acceso o experiencia', value: 'access' },
            { label: 'Pieza extra', value: 'extra' },
            { label: 'Otro', value: 'other' },
          ],
          admin: { condition: (_, sibling) => Boolean(sibling?.enabled) },
        },
        {
          name: 'text',
          label: 'Texto que verá el fan',
          type: 'textarea',
          admin: { condition: (_, sibling) => Boolean(sibling?.enabled) },
        },
        {
          name: 'limit',
          label: 'Para las primeras N compras',
          type: 'number',
          min: 1,
          admin: { condition: (_, sibling) => Boolean(sibling?.enabled), description: 'Déjalo vacío si no hay límite.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Compra',
      fields: [
        {
          name: 'buyUrl',
          label: 'Enlace de compra',
          type: 'text',
          admin: {
            description:
              'Mientras no esté el carrito de Shopify, el botón “Comprar” lleva aquí (p. ej. el producto en tu tienda de Shopify). Vacío = “Próximamente”.',
          },
        },
        { name: 'shopifyHandle', label: 'Handle del producto en Shopify', type: 'text', admin: { description: 'Para la conexión con Shopify más adelante.' } },
      ],
    },
    slugField('title'),
    { name: 'visible', label: 'Visible en el sitio', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Orden', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
