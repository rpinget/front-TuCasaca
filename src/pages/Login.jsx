import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as iniciarSesion } from '../services/api'
import './Auth.css'

const Login = () => {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // si ya hay sesión, no tiene sentido mostrar el login
  if (usuario) return <Navigate to="/" replace />

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.email.trim() || !form.password) {
      setError('Completá el email y la contraseña')
      return
    }

    try {
      setEnviando(true)
      // POST /api/auth/login; si el back no está, valida contra usuarios-demo.json
      const sesion = await iniciarSesion(form.email, form.password)
      login(sesion)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth__card">
        <h1>Ingresá</h1>
        <p className="auth__sub">Entrá y seguí armando tu colección.</p>

        <form className="auth__form" onSubmit={enviar} noValidate>
          {error && <div className="auth__alerta" role="alert">{error}</div>}

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={cambiar} />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password"
              value={form.password} onChange={cambiar} />
          </div>

          <button className="auth__btn" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth__pie">¿No tenés cuenta? <Link to="/registro">Creá tu cuenta</Link></p>
      </div>
    </section>
  )
}

export default Login
