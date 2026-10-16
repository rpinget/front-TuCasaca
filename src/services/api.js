// Capa de acceso a la API REST de TuCasaca (back Spring Boot).
//
// Usa URL ABSOLUTA al backend (no un proxy): asi el navegador hace la
// peticion cross-origin de verdad y es el CORS del back el que la habilita.
// En dev el back corre en http://localhost:8080; se puede sobreescribir con
// la variable de entorno VITE_API_URL (p. ej. para produccion).
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Pide un recurso GET publico y devuelve el JSON ya parseado.
// Sin header Authorization: estos endpoints son publicos y meter un token
// invalido haria que el JwtFilter del back responda 401/403.
async function pedir(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${path}`)
  }
  return res.json()
}

export const getCasacas = () => pedir('/api/casacas')
export const getCasaca = (id) => pedir(`/api/casacas/${id}`)
export const getCasacasPorLiga = (ligaId) => pedir(`/api/casacas/liga/${ligaId}`)
export const getLigas = () => pedir('/api/ligas')
export const getEquipos = () => pedir('/api/equipos')
