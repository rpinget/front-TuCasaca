import { createContext, useContext, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setUsuario,
  logout as logoutAction,
  clearAuthError,
  loginUser,
} from '../store/slices/authSlice'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const usuario = useSelector((state) => state.auth.usuario)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const login = useCallback(
    (datos) => {
      dispatch(setUsuario(datos))
    },
    [dispatch],
  )

  const logout = useCallback(() => {
    dispatch(logoutAction())
  }, [dispatch])

  // Despacha el thunk loginUser y retorna el payload o lanza error con .unwrap()
  const iniciarSesion = useCallback(
    async (email, password) => {
      return dispatch(loginUser({ email, password })).unwrap()
    },
    [dispatch],
  )

  const limpiarError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin,
        loading,
        error,
        login,
        logout,
        iniciarSesion,
        limpiarError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook propio para consumir el contexto en los componentes
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
