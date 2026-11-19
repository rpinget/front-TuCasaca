import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import EstadoVacio from './EstadoVacio'

const ProtectedRoute = ({ children, rol }) => {
  const usuario = useSelector((state) => state.auth.usuario)
  const isAuthenticated = Boolean(usuario)
  const location = useLocation()

  if (isAuthenticated && rol && usuario.rol !== rol) {
    return (
      <EstadoVacio
        titulo="Acceso restringido"
        mensaje="Esta sección es solo para administradores."
        linkTexto="Volver al inicio"
        linkTo="/"
      />
    )
  }

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace state={{ desde: location.pathname }} />
}

export default ProtectedRoute
