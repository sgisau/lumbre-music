import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Las páginas públicas se generan en cada visita (force-dynamic), así que un
 * cambio en el panel se ve al recargar. Este hook limpia además la caché de
 * Next por si alguna ruta se vuelve estática más adelante.
 */
const refresh = async () => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Fuera de Next (scripts de carga de datos) no hay caché que limpiar.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await refresh()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await refresh()
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await refresh()
  return doc
}
