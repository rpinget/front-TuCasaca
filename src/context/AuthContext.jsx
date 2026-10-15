import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// lee la sesión guardada (si existe) sin romper si localStorage no está disponible
const leerSesion = () => {
  try {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  // usuario = { token, id, email, nombre, rol } (misma forma que LoginResponseDTO) o null
  const [usuario, setUsuario] = useState(leerSesion)

  const login = (datos) => {
    setUsuario(datos)
    try { localStorage.setItem('usuario', JSON.stringify(datos)) } catch { /* sin storage */ }
  }

  const logout = () => {
    setUsuario(null)
    try { localStorage.removeItem('usuario') } catch { /* sin storage */ }
  }

  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// hook propio para usar el contexto más corto en los componentes
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
