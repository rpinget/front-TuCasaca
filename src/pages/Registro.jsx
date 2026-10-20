import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registrar } from '../services/api'
import './Auth.css'

const inicial = {
  nombreUsuario: '', nombre: '', apellido: '', email: '',
  password: '', confirmar: '', fechaNacimiento: '', sexo: '',
}

// valida los campos de UsuarioRegistroDTO y devuelve un objeto { campo: 'mensaje' }
const validar = (f) => {
  const e = {}
  if (!f.nombreUsuario.trim()) e.nombreUsuario = 'Ingresá un nombre de usuario'
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!f.email.trim()) e.email = 'Ingresá tu email'
  else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'El email no es válido'
  if (f.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
  if (f.confirmar !== f.password) e.confirmar = 'Las contraseñas no coinciden'
  if (!f.fechaNacimiento) e.fechaNacimiento = 'Ingresá tu fecha de nacimiento'
  if (!f.sexo) e.sexo = 'Seleccioná una opción'
  return e
}

const Campo = ({ id, label, type = 'text', form, errores, cambiar, children }) => (
  <div className={errores[id] ? 'campo campo--error' : 'campo'}>
    <label htmlFor={id}>{label}</label>
    {children ?? (
      <input id={id} name={id} type={type} value={form[id]} onChange={cambiar} />
    )}
    {errores[id] && <span className="campo__error">{errores[id]}</span>}
  </div>
)

const Registro = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [creada, setCreada] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    // POST /api/usuarios/registro con el UsuarioRegistroDTO (sin "confirmar").
    // Si el back no está, el registro es simulado.
    try {
      setEnviando(true)
      setErrorServidor(null)
      // eslint-disable-next-line no-unused-vars
      const { confirmar, ...datos } = form
      await registrar({ ...datos, email: datos.email.trim().toLowerCase(), fechaNacimiento: datos.fechaNacimiento })
      setCreada(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setErrorServidor(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const props = { form, errores, cambiar }

  return (
    <section className="auth">
      <div className="auth__card auth__card--ancha">
        <h1>Creá tu cuenta</h1>
        <p className="auth__sub">Completá tus datos para empezar a comprar.</p>

        {creada ? (
          <div className="auth__ok" role="status">
            Cuenta creada correctamente. Te llevamos al inicio de sesión...
          </div>
        ) : (
          <form className="auth__form" onSubmit={enviar} noValidate>
            {errorServidor && <div className="auth__alerta" role="alert">{errorServidor}</div>}
            <div className="auth__grid">
              <Campo id="nombre" label="Nombre" {...props} />
              <Campo id="apellido" label="Apellido" {...props} />
            </div>

            <Campo id="nombreUsuario" label="Nombre de usuario" {...props} />
            <Campo id="email" label="Email" type="email" {...props} />

            <div className="auth__grid">
              <Campo id="password" label="Contraseña" type="password" {...props} />
              <Campo id="confirmar" label="Repetir contraseña" type="password" {...props} />
            </div>

            <div className="auth__grid">
              <Campo id="fechaNacimiento" label="Fecha de nacimiento" type="date" {...props} />
              <Campo id="sexo" label="Sexo" {...props}>
                <select id="sexo" name="sexo" value={form.sexo} onChange={cambiar}>
                  <option value="">Seleccioná</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="NO_ESPECIFICA">Prefiero no decirlo</option>
                </select>
              </Campo>
            </div>

            <button className="auth__btn" type="submit" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="auth__pie">¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></p>
      </div>
    </section>
  )
}

export default Registro
