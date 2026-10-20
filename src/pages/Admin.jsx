import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getCasacas, getLigas, getEquipos, crearCasaca, editarCasaca, eliminarCasaca, esSesionMock,
} from '../services/api'
import './Auth.css'
import './Carrito.css'
import './Admin.css'
import './AdminUsuarios.css'
import AdminUsuarios from './AdminUsuarios'

const VACIO = {
  ligaId: '', equipoId: '', anio: '', jugador: '', numero: '', talle: '',
  precio: '', stock: '0', descripcion: '', imagenUrl: '', activo: true,
}

// mismas reglas que CasacaRequestDTO del back
const validar = (f) => {
  const e = {}
  if (!f.ligaId) e.ligaId = 'Elegí una liga'
  if (!f.equipoId) e.equipoId = 'Elegí un equipo'
  if (!f.talle.trim()) e.talle = 'El talle es obligatorio'
  if (!(Number(f.precio) > 0)) e.precio = 'El precio debe ser mayor a 0'
  if (f.stock === '' || Number(f.stock) < 0) e.stock = 'El stock no puede ser negativo'
  return e
}

const Admin = () => {
  const { usuario, esAdmin } = useAuth()

  const [tab, setTab] = useState('casacas')       // 'casacas' | 'usuarios'
  const [casacas, setCasacas] = useState([])
  const [ligas, setLigas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(null)          // null = formulario cerrado
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})
  const [aBorrar, setABorrar] = useState(null)    // id pendiente de confirmar baja
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!esAdmin) return
    const cargar = async () => {
      try {
        // GET /api/casacas devuelve todas (activas e inactivas); ligas y equipos alimentan el formulario
        const [casacasData, ligasData, equiposData] = await Promise.all([
          getCasacas(),
          getLigas(),
          getEquipos(),
        ])
        setCasacas(casacasData)
        setLigas(ligasData)
        setEquipos(equiposData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [esAdmin])

  // la ruta es solo para ADMIN (en el back lo valida Spring Security)
  if (!usuario) return <Navigate to="/login" replace />
  if (!esAdmin) {
    return (
      <section className="carrito__vacio">
        <h1>Acceso restringido</h1>
        <p>Esta sección es solo para administradores.</p>
        <Link to="/" className="carrito__btn">Volver al inicio</Link>
      </section>
    )
  }

  if (loading) return <p>Cargando casacas...</p>
  if (error) return <p>Error: {error}</p>

  const abrirAlta = () => {
    setEditandoId(null)
    setForm(VACIO)
    setErrores({})
  }

  const abrirEdicion = (c) => {
    setEditandoId(c.id)
    setForm({
      ligaId: String(c.liga.id), equipoId: String(c.equipo.id), anio: c.anio ?? '',
      jugador: c.jugador ?? '', numero: c.numero ?? '', talle: c.talle,
      precio: String(c.precio), stock: String(c.stock), descripcion: c.descripcion ?? '',
      imagenUrl: c.imagenUrl ?? '', activo: c.activo,
    })
    setErrores({})
  }

  const cerrar = () => { setForm(null); setEditandoId(null); setErrores({}); setErrorServidor(null) }

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    const nuevo = { ...form, [name]: type === 'checkbox' ? checked : value }
    if (name === 'ligaId') nuevo.equipoId = ''      // al cambiar la liga se reinicia el equipo
    setForm(nuevo)
  }

  const guardar = async (e) => {
    e.preventDefault()
    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const equipo = equipos.find((x) => x.id === Number(form.equipoId))
    const datos = {
      equipoId: equipo.id,
      ligaId: equipo.liga.id,
      anio: form.anio === '' ? null : Number(form.anio),
      jugador: form.jugador.trim(),
      numero: form.numero === '' ? null : Number(form.numero),
      talle: form.talle.trim().toUpperCase(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      descripcion: form.descripcion.trim(),
      imagenUrl: form.imagenUrl.trim() || `https://placehold.co/400x400?text=${encodeURIComponent(equipo.nombre)}`,
      activo: form.activo,
    }

    try {
      setGuardando(true)
      setErrorServidor(null)
      if (esSesionMock(usuario)) {
        // sesión simulada (se inició sin back): solo se actualiza la pantalla
        const completa = { equipo, liga: equipo.liga, ...datos }
        if (editandoId) {
          setCasacas(casacas.map((c) => (c.id === editandoId ? { ...c, ...completa } : c)))
        } else {
          const nuevoId = Math.max(0, ...casacas.map((c) => c.id)) + 1
          setCasacas([
            ...casacas,
            {
              id: nuevoId, ...completa, creadorId: usuario.id,
              creadorNombreUsuario: usuario.nombre, fechaCreacion: new Date().toISOString(),
            },
          ])
        }
      } else if (editandoId) {
        // PUT /api/casacas/{id}
        const actualizada = await editarCasaca(usuario, editandoId, datos)
        setCasacas(casacas.map((c) => (c.id === editandoId ? actualizada : c)))
      } else {
        // POST /api/casacas
        const creada = await crearCasaca(usuario, datos)
        setCasacas([...casacas, creada])
      }
      cerrar()
    } catch (err) {
      setErrorServidor(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const borrar = async (id) => {
    try {
      setErrorServidor(null)
      // DELETE /api/casacas/{id} (sesión simulada: solo se saca de la pantalla)
      if (!esSesionMock(usuario)) await eliminarCasaca(usuario, id)
      setCasacas(casacas.filter((c) => c.id !== id))
    } catch (err) {
      setErrorServidor(err.message)
    } finally {
      setABorrar(null)
    }
  }

  const equiposDeLiga = equipos.filter((x) => String(x.liga.id) === String(form?.ligaId))

  return (
    <section className="admin">
      <div className="admin__cabecera">
        <div>
          <h1>Administración</h1>
          <p className="admin__sub">{tab === 'casacas' ? `${casacas.length} casacas cargadas` : 'Gestión de usuarios'}</p>
        </div>
        {tab === 'casacas' && <button className="admin__nuevo" onClick={abrirAlta}>Nueva casaca</button>}
      </div>

      <div className="admin__tabs">
        <button className={tab === 'casacas' ? 'admin__tab admin__tab--activa' : 'admin__tab'} onClick={() => setTab('casacas')}>Casacas</button>
        <button className={tab === 'usuarios' ? 'admin__tab admin__tab--activa' : 'admin__tab'} onClick={() => setTab('usuarios')}>Usuarios</button>
      </div>

      {tab === 'usuarios' && <AdminUsuarios sesion={usuario} />}

      {tab === 'casacas' && (<>
      {errorServidor && !form && <p className="carrito__error" role="alert">{errorServidor}</p>}

      <table className="admin__tabla">
        <thead>
          <tr>
            <th>Casaca</th><th>Liga</th><th>Talle</th><th>Precio</th>
            <th>Stock</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          {casacas.map((c) => (
            <tr key={c.id}>
              <td data-label="Casaca">
                <strong>{c.equipo.nombre} {c.anio}</strong>
                <span>{c.jugador} #{c.numero}</span>
              </td>
              <td data-label="Liga">{c.liga.nombre}</td>
              <td data-label="Talle">{c.talle}</td>
              <td data-label="Precio">${c.precio.toLocaleString('es-AR')}</td>
              <td data-label="Stock">{c.stock}</td>
              <td data-label="Estado">
                <span className={c.activo ? 'admin__estado' : 'admin__estado admin__estado--off'}>
                  {c.activo ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="admin__acciones">
                {aBorrar === c.id ? (
                  <>
                    <button className="admin__peligro" onClick={() => borrar(c.id)}>Confirmar baja</button>
                    <button onClick={() => setABorrar(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => abrirEdicion(c)}>Editar</button>
                    <button className="admin__borrar" onClick={() => setABorrar(c.id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {casacas.length === 0 && <p>No hay casacas cargadas.</p>}
      </>)}

      {form && (
        <div className="admin__fondo" onClick={cerrar}>
          <form className="admin__form" onClick={(e) => e.stopPropagation()} onSubmit={guardar} noValidate>
            <h2>{editandoId ? 'Editar casaca' : 'Nueva casaca'}</h2>
            {errorServidor && <div className="auth__alerta" role="alert">{errorServidor}</div>}

            <div className="auth__grid">
              <div className={errores.ligaId ? 'campo campo--error' : 'campo'}>
                <label htmlFor="ligaId">Liga</label>
                <select id="ligaId" name="ligaId" value={form.ligaId} onChange={cambiar}>
                  <option value="">Seleccioná</option>
                  {ligas.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
                {errores.ligaId && <span className="campo__error">{errores.ligaId}</span>}
              </div>

              <div className={errores.equipoId ? 'campo campo--error' : 'campo'}>
                <label htmlFor="equipoId">Equipo</label>
                <select id="equipoId" name="equipoId" value={form.equipoId} onChange={cambiar} disabled={!form.ligaId}>
                  <option value="">{form.ligaId ? 'Seleccioná' : 'Elegí primero la liga'}</option>
                  {equiposDeLiga.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                </select>
                {errores.equipoId && <span className="campo__error">{errores.equipoId}</span>}
              </div>
            </div>

            <div className="auth__grid">
              <div className="campo">
                <label htmlFor="jugador">Jugador</label>
                <input id="jugador" name="jugador" value={form.jugador} onChange={cambiar} />
              </div>
              <div className="admin__doble">
                <div className="campo">
                  <label htmlFor="numero">Número</label>
                  <input id="numero" name="numero" type="number" min="0" value={form.numero} onChange={cambiar} />
                </div>
                <div className="campo">
                  <label htmlFor="anio">Año</label>
                  <input id="anio" name="anio" type="number" min="1900" value={form.anio} onChange={cambiar} />
                </div>
              </div>
            </div>

            <div className="auth__grid">
              <div className={errores.talle ? 'campo campo--error' : 'campo'}>
                <label htmlFor="talle">Talle</label>
                <input id="talle" name="talle" placeholder="S, M, L..." value={form.talle} onChange={cambiar} />
                {errores.talle && <span className="campo__error">{errores.talle}</span>}
              </div>
              <div className="admin__doble">
                <div className={errores.precio ? 'campo campo--error' : 'campo'}>
                  <label htmlFor="precio">Precio</label>
                  <input id="precio" name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={cambiar} />
                  {errores.precio && <span className="campo__error">{errores.precio}</span>}
                </div>
                <div className={errores.stock ? 'campo campo--error' : 'campo'}>
                  <label htmlFor="stock">Stock</label>
                  <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={cambiar} />
                  {errores.stock && <span className="campo__error">{errores.stock}</span>}
                </div>
              </div>
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Descripción</label>
              <input id="descripcion" name="descripcion" value={form.descripcion} onChange={cambiar} />
            </div>

            <div className="campo">
              <label htmlFor="imagenUrl">URL de la imagen (opcional)</label>
              <input id="imagenUrl" name="imagenUrl" value={form.imagenUrl} onChange={cambiar} />
            </div>

            <label className="admin__check">
              <input type="checkbox" name="activo" checked={form.activo} onChange={cambiar} />
              Casaca activa (visible en la tienda)
            </label>

            <div className="admin__botones">
              <button type="button" className="admin__cancelar" onClick={cerrar}>Cancelar</button>
              <button type="submit" className="auth__btn" disabled={guardando}>
                {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear casaca'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Admin
