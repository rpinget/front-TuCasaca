// Endpoints de administración de usuarios (solo ADMIN):
//   GET    /api/usuarios            -> lista de UsuarioResponseDTO
//   DELETE /api/usuarios/admin/{id} -> baja lógica del usuario
// Reutiliza pedir/enviar de services/api.js para unificar timeouts, fallback a
// /public/data y lectura del `message` de ApiErrorDTO.
import { pedir, enviar, leerMock, FORZAR_MOCK, TOKEN_MOCK } from './api'

export const listarUsuarios = (token) =>
  pedir('/api/usuarios', () => leerMock('usuarios.json'), token)

export async function bajaUsuario(id, token) {
  if (FORZAR_MOCK || token === TOKEN_MOCK) return // MOCK: la baja solo se refleja en pantalla
  try {
    await enviar('DELETE', `/api/usuarios/admin/${id}`, { token })
  } catch (err) {
    if (err.sinConexion) return // back apagado: queda solo en pantalla
    throw err
  }
}
