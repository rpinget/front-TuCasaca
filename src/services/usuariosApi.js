// Endpoints de administración de usuarios (solo ADMIN):
//   GET    /api/usuarios            -> lista de UsuarioResponseDTO
//   DELETE /api/usuarios/admin/{id} -> baja lógica del usuario
// Misma lógica que services/api.js: se intenta el back real y, si no responde
// (o se fuerza con VITE_USE_MOCK=true), se usan los JSON de /public/data.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const FORZAR_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const TIMEOUT_MS = 2000

const leerMock = async () => {
  const res = await fetch('/data/usuarios.json')
  if (!res.ok) throw new Error('No se pudo leer los datos locales (usuarios.json)')
  return res.json()
}

// el login del front todavía puede ser mock: ese token no sirve en el back
const usaMock = (token) => FORZAR_MOCK || token === 'mock-token'

export async function listarUsuarios(token) {
  if (usaMock(token)) return leerMock()
  let res
  try {
    res = await fetch(`${BASE}/api/usuarios`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    return leerMock() // back apagado
  }
  if (!res.ok) throw new Error(`Error ${res.status} al pedir /api/usuarios`)
  return res.json()
}

export async function bajaUsuario(id, token) {
  if (usaMock(token)) return // MOCK: la baja solo se refleja en pantalla
  let res
  try {
    res = await fetch(`${BASE}/api/usuarios/admin/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    return // back apagado: queda solo en pantalla
  }
  if (!res.ok) throw new Error(`Error ${res.status} al dar de baja al usuario`)
}
