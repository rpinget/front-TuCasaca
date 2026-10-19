import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUsuarioMe } from '../services/api'
import './Carrito.css'
import './Perfil.css'

const formatearFecha = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR') : '-'

const Perfil = () => {
  const { usuario } = useAuth()
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect con [usuario] -> pide el perfil del usuario logueado (GET /api/usuarios/me)
  // y lo vuelve a pedir si cambia la sesión
  useEffect(() => {
    if (!usuario) return
    const cargar = async () => {
      try {
        setLoading(true)
        setDatos(await getUsuarioMe(usuario))
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [usuario])

  if (!usuario) return <Navigate to="/login" replace />
  if (loading) return <p>Cargando perfil...</p>
  if (error) {
    return (
      <section>
        <p>Error: {error}</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    )
  }

  const filas = [
    ['Usuario', datos.nombreUsuario],
    ['Nombre', `${datos.nombre} ${datos.apellido ?? ''}`.trim()],
    ['Email', datos.email],
    ['Fecha de nacimiento', formatearFecha(datos.fechaNacimiento)],
    ['Sexo', datos.sexo],
    ['Rol', datos.rol],
    ['Miembro desde', formatearFecha(datos.fechaCreacion?.slice(0, 10))],
  ]

  return (
    <section className="perfil">
      <h1>Mi perfil</h1>
      <dl className="perfil__datos">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt>{etiqueta}</dt>
            <dd>{valor ?? '-'}</dd>
          </div>
        ))}
      </dl>
      <div className="perfil__links">
        <Link to="/carrito" className="carrito__btn">Ir a mi carrito</Link>
        <Link to="/favoritos" className="carrito__vaciar">Ver mis favoritos</Link>
      </div>
    </section>
  )
}

export default Perfil
