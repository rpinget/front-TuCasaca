import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Campo from '../components/Campo'
import './Auth.css'

const Login = () => {
  const { usuario, iniciarSesion, loading, error: authError, limpiarError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errorLocal, setErrorLocal] = useState(null)

  // si ya hay sesión, no tiene sentido mostrar el login
  if (usuario) return <Navigate to="/" replace />

  const cambiar = (e) => {
    if (authError) limpiarError()
    if (errorLocal) setErrorLocal(null)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const enviar = async (e) => {
    e.preventDefault()
    setErrorLocal(null)

    if (!form.email.trim() || !form.password) {
      setErrorLocal('Completá el email y la contraseña')
      return
    }

    try {
      // Despacha loginUser via Redux Toolkit thunk
      await iniciarSesion(form.email, form.password)
      navigate('/')
    } catch {
      // El error de backend/red ya fue capturado y almacenado en auth.error por Redux
    }
  }

  const error = errorLocal || authError

  return (
    <section className="auth">
      <div className="auth__card">
        <h1>Ingresá</h1>
        <p className="auth__sub">Entrá y seguí armando tu colección.</p>

        <form className="auth__form" onSubmit={enviar} noValidate>
          {error && <div className="auth__alerta" role="alert">{error}</div>}

          <Campo id="email" label="Email" type="email" autoComplete="email"
            form={form} cambiar={cambiar} />

          <Campo id="password" label="Contraseña" type="password" autoComplete="current-password"
            form={form} cambiar={cambiar} />

          <button className="auth__btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth__pie">¿No tenés cuenta? <Link to="/registro">Creá tu cuenta</Link></p>
      </div>
    </section>
  )
}

export default Login
