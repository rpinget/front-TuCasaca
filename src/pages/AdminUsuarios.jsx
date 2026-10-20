import { useState, useEffect } from 'react'
import { listarUsuarios, bajaUsuario } from '../services/usuariosApi'

// Pestaña "Usuarios" del panel de administración (GET /api/usuarios y DELETE /api/usuarios/admin/{id})
const AdminUsuarios = ({ sesion }) => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [aBajar, setABajar] = useState(null) // id pendiente de confirmar

  useEffect(() => {
    const cargar = async () => {
      try {
        setUsuarios(await listarUsuarios(sesion.token))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [sesion.token])

  const darDeBaja = async (id) => {
    setAviso(null)
    try {
      await bajaUsuario(id, sesion.token)
      // baja lógica: el usuario queda inactivo, no se borra de la lista
      setUsuarios((lista) => lista.map((u) => (u.id === id ? { ...u, activo: false } : u)))
    } catch (err) {
      setAviso(err.message)
    } finally {
      setABajar(null)
    }
  }

  if (loading) return <p>Cargando usuarios...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <>
      {aviso && <p className="admin__aviso">{aviso}</p>}
      <table className="admin__tabla">
        <thead>
          <tr>
            <th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td data-label="Usuario">
                <strong>{u.nombre} {u.apellido}</strong>
                <span>@{u.nombreUsuario}</span>
              </td>
              <td data-label="Email">{u.email}</td>
              <td data-label="Rol"><span className="admin__rol">{u.rol}</span></td>
              <td data-label="Estado">
                <span className={u.activo ? 'admin__estado' : 'admin__estado admin__estado--off'}>
                  {u.activo ? 'Activo' : 'De baja'}
                </span>
              </td>
              <td className="admin__acciones">
                {u.id === sesion.id || !u.activo ? null : aBajar === u.id ? (
                  <>
                    <button className="admin__peligro" onClick={() => darDeBaja(u.id)}>Confirmar baja</button>
                    <button onClick={() => setABajar(null)}>Cancelar</button>
                  </>
                ) : (
                  <button className="admin__borrar" onClick={() => setABajar(u.id)}>Dar de baja</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {usuarios.length === 0 && <p>No hay usuarios cargados.</p>}
    </>
  )
}

export default AdminUsuarios
