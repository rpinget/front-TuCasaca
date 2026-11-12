import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login as loginApi } from '../../services/api'

// Lee la sesión guardada en localStorage si existe
const leerSesion = () => {
  try {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

// Thunk asíncrono para autenticar al usuario contra el backend.
// Dispara:
// - loginUser.pending
// - loginUser.fulfilled
// - loginUser.rejected
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const sesion = await loginApi(email, password)
      try {
        localStorage.setItem('usuario', JSON.stringify(sesion))
      } catch {
        // sin storage disponible
      }
      return sesion
    } catch (err) {
      return rejectWithValue(err.message || 'Error al iniciar sesión')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    usuario: leerSesion(),
    loading: false,
    error: null,
  },

  reducers: {
    // Cierra sesión: limpia el usuario en memoria y en localStorage
    logout: (state) => {
      state.usuario = null
      state.error = null
      try {
        localStorage.removeItem('usuario')
      } catch {
        // sin storage disponible
      }
    },

    // Establece o actualiza manualmente la sesión (p. ej. tras registro exitoso)
    setUsuario: (state, action) => {
      state.usuario = action.payload
      state.error = null
      try {
        localStorage.setItem('usuario', JSON.stringify(action.payload))
      } catch {
        // sin storage disponible
      }
    },

    // Limpia el mensaje de error de autenticación
    clearAuthError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      // 1. PENDING: Petición en vuelo -> activamos loading y limpiamos errores previos
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // 2. FULFILLED: Login exitoso -> guardamos el usuario/token y apagamos loading
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.usuario = action.payload
        state.error = null
      })
      // 3. REJECTED: Credenciales incorrectas o error de red -> guardamos el error
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Error de autenticación'
      })
  },
})

export const { logout, setUsuario, clearAuthError } = authSlice.actions

export default authSlice.reducer
