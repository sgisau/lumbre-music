# Lumbre Music — sitio oficial y panel administrativo

Sitio del sello con roster, lanzamientos, videos, eventos y tienda, más un panel privado en `/admin` para editar todo sin tocar código.

Hecho con [Next.js](https://nextjs.org) y [Payload CMS](https://payloadcms.com) sobre PostgreSQL.

## Qué se edita desde el panel

Entra en `https://tu-dominio/admin` (también hay un enlace discreto en el pie de página: “Acceso administradores”).

| Sección del panel | Qué puedes hacer |
| --- | --- |
| **Artistas** | Añadir, editar, ocultar o borrar artistas. Fotos (tarjeta y cabecera), bio, enlaces, redes, correo de booking y orden. |
| **Artistas → pestaña Oyentes** | Actualizar los oyentes mensuales. La fecha “Actualizado el” se pone sola al cambiar la cifra. |
| **Lanzamientos** | Sencillos, EPs y álbumes con portada, canciones, enlaces y pre-save. Se pueden dejar en borrador o programar su publicación. |
| **Videos** | Pegar un enlace de YouTube y elegir si es video (horizontal) o clip (vertical). |
| **Eventos** | Fechas con ciudad, lugar, enlace de boletos y estado (disponible, pocos, agotado, cancelado). Las pasadas se ocultan solas. |
| **Productos** | Merch con fotos, precio, tallas, etiquetas y **beneficio fan opcional** por producto. |
| **Página de inicio** | Lanzamiento del momento, imagen o video de portada, drop de tienda y el **orden y visibilidad de cada bloque**. |
| **Ajustes del sitio** | **Logo principal, logo para fondo claro y favicon**, aviso superior, redes, correos de contacto, políticas de envío y devoluciones y SEO. |
| **Página Nosotros** | Texto e imagen de la página. |
| **Administradores** | Alta y baja de usuarios y sus roles (solo superadministrador). |

### Roles

| Rol | Puede editar |
| --- | --- |
| Superadministrador | Todo, incluidos usuarios y roles. |
| Contenido | Artistas, lanzamientos, videos, eventos, home, ajustes y Nosotros. |
| Tienda | Productos y el bloque de tienda de la home. |
| Eventos | Eventos. |

La **primera persona que se registre** en `/admin` queda como superadministrador. Hazlo en cuanto publiques el sitio.

## Trabajar en local

Requisitos: Node.js 22 y PostgreSQL 16.

```bash
cp .env.example .env      # rellena DATABASE_URL y PAYLOAD_SECRET
npm install
npm run dev               # http://localhost:3000 y http://localhost:3000/admin
```

Contenido de demostración, solo para probar (todo dice “Artista 01”, “Producto 01”…):

```bash
npm run seed:demo
```

## Publicar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** e importa este repositorio.
2. En **Storage** crea una base de datos **Postgres (Neon)** y conéctala al proyecto. Copia su cadena de conexión en la variable `DATABASE_URL`.
3. En **Storage** crea un **Blob store** y conéctalo. Vercel añade `BLOB_READ_WRITE_TOKEN` (sin esto las imágenes subidas se pierden en cada despliegue).
4. En **Settings → Environment Variables** añade:
   - `PAYLOAD_SECRET`: una cadena larga y aleatoria.
   - `NEXT_PUBLIC_SITE_URL`: la dirección final, p. ej. `https://lumbremusic.com`.
   - `CRON_SECRET`: otra cadena aleatoria.
   - `SITE_TIMEZONE`: la zona horaria de las fechas de eventos (por defecto `America/Mexico_City`).
5. **Deploy**. Las tablas de la base de datos se crean solas al arrancar.
6. Entra en `/admin` y crea tu usuario de superadministrador.
7. En **Settings → Domains** conecta el dominio de Lumbre.

**Lanzamientos programados:** el cron de `vercel.json` los publica una vez al día (límite del plan gratuito de Vercel). Con el plan Pro puedes cambiarlo a cada 5 minutos (`*/5 * * * *`).

## Cambios en la estructura de datos

Si se añaden campos o colecciones en `src/collections` o `src/globals`, genera una migración antes de publicar:

```bash
npm run payload migrate:create nombre-del-cambio
npm run generate:types
```

## Pendiente

- **Carrito y pago con Shopify (fase 4).** Hoy el botón “Comprar” de cada producto lleva al “Enlace de compra” que pongas en el panel; si está vacío dice “Próximamente”.
- **Correo para recuperar contraseñas.** Falta conectar un servicio de envío de correo (p. ej. Resend). Mientras tanto, el superadministrador puede cambiar la contraseña de cualquier usuario desde el panel.
- **Newsletter.** El bloque aparece cuando pegas en Ajustes del sitio el enlace del formulario de tu servicio de correo.
