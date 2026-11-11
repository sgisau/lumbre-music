import type { GlobalConfig } from 'payload'

import { anyone, roles } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Ajustes del sitio',
  admin: {
    group: 'Configuración',
    description: 'Logos, aviso superior, redes y correos de contacto.',
  },
  access: {
    read: anyone,
    update: roles('contenido'),
  },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Logos',
          fields: [
            {
              name: 'logo',
              label: 'Logo principal (para fondo negro)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'De preferencia SVG o PNG transparente, en blanco o hueso.' },
            },
            {
              name: 'logoDark',
              label: 'Logo para fondo claro',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Versión en negro para bloques blancos. Opcional.' },
            },
            {
              name: 'favicon',
              label: 'Ícono de pestaña (favicon)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Cuadrado, mínimo 512 × 512 px.' },
            },
            { name: 'siteName', label: 'Nombre del sitio', type: 'text', defaultValue: 'Lumbre Music' },
            { name: 'tagline', label: 'Lema', type: 'text', admin: { description: 'Aparece en el pie de página.' } },
          ],
        },
        {
          label: 'Aviso superior',
          fields: [
            { name: 'announcementEnabled', label: 'Mostrar aviso', type: 'checkbox', defaultValue: false },
            {
              name: 'announcementText',
              label: 'Texto del aviso',
              type: 'text',
              admin: { description: 'P. ej. drop actual o condición de envío.' },
            },
            { name: 'announcementUrl', label: 'Enlace del aviso', type: 'text' },
          ],
        },
        {
          label: 'Redes y contacto',
          fields: [
            {
              name: 'socials',
              label: 'Redes oficiales de Lumbre',
              type: 'array',
              labels: { singular: 'Red', plural: 'Redes' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Nombre', type: 'text', required: true },
                    { name: 'url', label: 'Enlace', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'newsletterUrl',
              label: 'Enlace del formulario de newsletter',
              type: 'text',
              admin: {
                description:
                  'Formulario de tu servicio de correo (Klaviyo, Mailchimp, Shopify Email…). Vacío = no se muestra el bloque de newsletter.',
              },
            },
            { name: 'bookingEmail', label: 'Correo de booking', type: 'email' },
            { name: 'pressEmail', label: 'Correo de prensa', type: 'email' },
            { name: 'contactEmail', label: 'Correo general', type: 'email' },
            {
              name: 'demosEmail',
              label: 'Correo para demos',
              type: 'email',
              admin: { description: 'Vacío = no se muestra la sección de demos.' },
            },
          ],
        },
        {
          label: 'Tienda',
          fields: [
            {
              name: 'shippingPolicy',
              label: 'Política de envíos',
              type: 'richText',
              admin: { description: 'Se muestra en la tienda y en cada producto.' },
            },
            { name: 'returnsPolicy', label: 'Cambios y devoluciones', type: 'richText' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoDescription', label: 'Descripción para Google', type: 'textarea' },
            { name: 'shareImage', label: 'Imagen al compartir en redes', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
