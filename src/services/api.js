// Capa de acceso a la API REST de TuCasaca (back Spring Boot).
//
// Usa URL ABSOLUTA al backend (no un proxy): asi el navegador hace la
// peticion cross-origin de verdad y es el CORS del back el que la habilita.
// En dev el back corre en http://localhost:8080; se puede sobreescribir con
// la variable de entorno VITE_API_URL (p. ej. para produccion).
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// VITE_USE_MOCK=true fuerza a leer siempre los JSON locales de /public/data
// (la consigna del TPO 03). Si no esta seteada, se intenta el back primero.
const FORZAR_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Lee un JSON estatico de /public/data (misma forma que los DTOs del back).
async function leerMock(archivo) {
  const res = await fetch(`/data/${archivo}`)
  if (!res.ok) throw new Error(`No se pudo leer los datos locales (${archivo})`)
  return res.json()
}

// Pide un recurso GET publico y devuelve el JSON ya parseado.
// Sin header Authorization: estos endpoints son publicos y meter un token
// invalido haria que el JwtFilter del back responda 401/403.
//
// Si el back no esta levantado (fetch falla por red) se usa `mock()`, que lee
// los JSON locales. Si el back responde con un error HTTP (404, 500...) NO se
// hace fallback: ese error es real y se muestra.
async function pedir(path, mock) {
  if (FORZAR_MOCK) return mock()
  let res
  try {
    res = await fetch(`${BASE}${path}`)
  } catch {
    return mock()
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${path}`)
  }
  return res.json()
}

// el back solo devuelve casacas activas; el mock replica ese comportamiento
const soloActivas = (casacas) => casacas.filter((c) => c.activo)

export const getCasacas = () =>
  pedir('/api/casacas', async () => soloActivas(await leerMock('casacas.json')))

export const getCasaca = (id) =>
  pedir(`/api/casacas/${id}`, async () => {
    const casaca = soloActivas(await leerMock('casacas.json')).find((c) => c.id === Number(id))
    if (!casaca) throw new Error(`Error 404 al pedir /api/casacas/${id}`)
    return casaca
  })

export const getCasacasPorLiga = (ligaId) =>
  pedir(`/api/casacas/liga/${ligaId}`, async () =>
    soloActivas(await leerMock('casacas.json')).filter((c) => c.liga.id === Number(ligaId)))

export const getLigas = () => pedir('/api/ligas', () => leerMock('ligas.json'))
export const getEquipos = () => pedir('/api/equipos', () => leerMock('equipos.json'))
