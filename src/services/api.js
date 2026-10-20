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

const TIMEOUT_MS = 2000          // lecturas: si el back no contesta se usa el mock
const TIMEOUT_ESCRITURA_MS = 10000 // altas, compras, etc.: pueden tardar más

// token de las sesiones simuladas (login hecho con los JSON, sin back)
export const TOKEN_MOCK = 'mock-token'
export const esSesionMock = (sesion) => sesion?.token === TOKEN_MOCK

// Lee un JSON estatico de /public/data (misma forma que los DTOs del back).
async function leerMock(archivo) {
  const res = await fetch(`/data/${archivo}`)
  if (!res.ok) throw new Error(`No se pudo leer los datos locales (${archivo})`)
  return res.json()
}

// Pide un recurso GET (publico, o con token si se pasa) y devuelve el JSON ya parseado.
// Sin header Authorization: estos endpoints son publicos y meter un token
// invalido haria que el JwtFilter del back responda 401/403.
//
// Si el back no esta levantado (fetch falla por red) se usa `mock()`, que lee
// los JSON locales. Si el back responde con un error HTTP (404, 500...) NO se
// hace fallback: ese error es real y se muestra.
async function pedir(path, mock, token) {
  // el login todavia es mock: ese token no sirve en el back, asi que se usan los JSON
  if (FORZAR_MOCK || token === TOKEN_MOCK) return mock()
  let res
  try {
    // si el back no contesta en TIMEOUT_MS se corta y se usa el mock
    res = await fetch(`${BASE}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    return mock()
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status} al pedir ${path}`)
  }
  return res.json()
}

export const getCasacas = () =>
  pedir('/api/casacas', () => leerMock('casacas.json'))

export const getCasaca = (id) =>
  pedir(`/api/casacas/${id}`, async () => {
    const casaca = (await leerMock('casacas.json')).find((c) => c.id === Number(id))
    if (!casaca) throw new Error(`Error 404 al pedir /api/casacas/${id}`)
    return casaca
  })

export const getCasacasPorLiga = (ligaId) =>
  pedir(`/api/casacas/liga/${ligaId}`, async () =>
    (await leerMock('casacas.json')).filter((c) => c.liga.id === Number(ligaId)))

export const getLigas = () => pedir('/api/ligas', () => leerMock('ligas.json'))
export const getEquipos = () => pedir('/api/equipos', () => leerMock('equipos.json'))

// GET /api/usuarios/me (requiere token). El mock devuelve usuario.json pero con
// los datos de la sesion, para que cada usuario de prueba vea su propio perfil.
export const getUsuarioMe = (sesion) =>
  pedir('/api/usuarios/me', async () => ({
    ...(await leerMock('usuario.json')),
    id: sesion.id,
    email: sesion.email,
    nombre: sesion.nombre,
    rol: sesion.rol,
  }), sesion.token)

// ---------------------------------------------------------------------------
// Operaciones que modifican datos (POST / PUT / DELETE).
// Si el back responde con error, se lanza un Error con el `message` del
// ApiErrorDTO (ej: "El email ya está registrado"). Si no hay conexion, el error
// trae `sinConexion = true` para que quien llama decida si usa el mock.
// ---------------------------------------------------------------------------
async function enviar(metodo, path, { body, token } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method: metodo,
      signal: AbortSignal.timeout(TIMEOUT_ESCRITURA_MS),
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const error = new Error('No se pudo conectar con el servidor')
    error.sinConexion = true
    throw error
  }
  if (!res.ok) {
    let mensaje = `Error ${res.status} al pedir ${path}`
    try {
      const detalle = await res.json()
      if (detalle.message) mensaje = detalle.message
    } catch { /* la respuesta no era JSON */ }
    throw new Error(mensaje)
  }
  return res.status === 204 ? null : res.json()
}

// --- Auth ------------------------------------------------------------------
// POST /api/auth/login -> { token, id, email, nombre, rol } (LoginResponseDTO).
// Sin back: se valida contra usuarios-demo.json y se devuelve la misma forma.
async function loginMock(email, password) {
  const usuarios = await leerMock('usuarios-demo.json')
  const u = usuarios.find((x) => x.email === email && x.password === password)
  if (!u) throw new Error('Email o contraseña incorrectos')
  return { token: TOKEN_MOCK, id: u.id, email: u.email, nombre: u.nombre, rol: u.rol }
}

export async function login(email, password) {
  const emailNormalizado = email.trim().toLowerCase()
  if (FORZAR_MOCK) return loginMock(emailNormalizado, password)
  try {
    return await enviar('POST', '/api/auth/login', { body: { email: emailNormalizado, password } })
  } catch (err) {
    if (err.sinConexion) return loginMock(emailNormalizado, password)
    throw err
  }
}

// POST /api/usuarios/registro (UsuarioRegistroDTO). Sin back, el registro es simulado.
export async function registrar(datos) {
  if (FORZAR_MOCK) return null
  try {
    return await enviar('POST', '/api/usuarios/registro', { body: datos })
  } catch (err) {
    if (err.sinConexion) return null
    throw err
  }
}

// --- Carrito (todas requieren token; devuelven el CarritoDTO actualizado) ----
export const getCarrito = (s) => enviar('GET', `/api/carritos/${s.id}`, { token: s.token })
export const agregarItem = (s, casacaId, cantidad) =>
  enviar('POST', `/api/carritos/${s.id}/items`, { token: s.token, body: { casacaId, cantidad } })
export const quitarItem = (s, itemId) =>
  enviar('DELETE', `/api/carritos/${s.id}/items/${itemId}`, { token: s.token })
export const vaciarCarrito = (s) => enviar('DELETE', `/api/carritos/${s.id}/vaciar`, { token: s.token })
export const confirmarCompra = (s) => enviar('POST', `/api/carritos/${s.id}/checkout`, { token: s.token })

// --- Casacas (ABM, requiere token; el back valida que sea el creador o ADMIN) ---
export const crearCasaca = (s, datos) => enviar('POST', '/api/casacas', { token: s.token, body: datos })
export const editarCasaca = (s, id, datos) => enviar('PUT', `/api/casacas/${id}`, { token: s.token, body: datos })
export const eliminarCasaca = (s, id) => enviar('DELETE', `/api/casacas/${id}`, { token: s.token })
