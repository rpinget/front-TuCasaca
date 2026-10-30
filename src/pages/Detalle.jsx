import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import CamisetaImg from '../components/CamisetaImg'
import FavoritoBtn from '../components/FavoritoBtn'
import { getCasaca } from '../services/api'
import './Detalle.css'

const Detalle = () => {
  // useParams lee el :id de la ruta /casacas/:id
  const { id } = useParams()

  const [casaca, setCasaca] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const [errorCarrito, setErrorCarrito] = useState(null)

  const { usuario } = useAuth()
  const { agregar } = useCarrito()
  const navigate = useNavigate()

  // useEffect con [id] -> se vuelve a ejecutar cada vez que cambia el id de la
  // URL. Pide la casaca directo al back (GET /api/casacas/{id}); si no existe,
  // el back responde 404 y getCasaca lanza el error que mostramos abajo.
  useEffect(() => {
    const cargarCasaca = async () => {
      try {
        setLoading(true)
        const data = await getCasaca(id)
        setCasaca(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarCasaca()
  }, [id])

  if (loading) return <p>Cargando casaca...</p>
  if (error) {
    return (
      <section>
        <p>Error: {error}</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    )
  }

  const sinStock = casaca.stock === 0

  const agregarAlCarrito = async () => {
    // para comprar hay que estar logueado (en el back el carrito exige token)
    if (!usuario) {
      navigate('/login')
      return
    }
    try {
      setErrorCarrito(null)
      await agregar(casaca, cantidad)
      setAgregado(true)
    } catch (err) {
      setAgregado(false)
      setErrorCarrito(err.message)
    }
  }

  return (
    <section className="detalle">
      <Link to="/">← Volver</Link>
      <div className="detalle__contenido">
        <CamisetaImg casaca={casaca} className="detalle__img" />
        <div className="detalle__info">
          <span className="detalle__liga">{casaca.liga.nombre} · {casaca.liga.pais}</span>
          <h1>{casaca.equipo.nombre} {casaca.anio}</h1>
          <p>{casaca.descripcion}</p>
          <ul>
            <li><strong>Jugador:</strong> {casaca.jugador}</li>
            <li><strong>Número:</strong> {casaca.numero}</li>
            <li><strong>Talle:</strong> {casaca.talle}</li>
            <li><strong>Vendedor:</strong> {casaca.creadorNombreUsuario}</li>
          </ul>
          <p className="detalle__precio">${casaca.precio.toLocaleString('es-AR')}</p>
          <p className={sinStock ? 'sin-stock' : 'en-stock'}>
            {sinStock ? 'Agotado' : `Stock disponible: ${casaca.stock}`}
          </p>

          {!sinStock && (
            <div className="detalle__compra">
              <label htmlFor="cantidad">Cantidad</label>
              <select id="cantidad" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}>
                {Array.from({ length: casaca.stock }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button className="detalle__btn" onClick={agregarAlCarrito}>
                {usuario ? 'Agregar al carrito' : 'Ingresá para comprar'}
              </button>
              <FavoritoBtn casaca={casaca} />
            </div>
          )}

          {errorCarrito && <p className="detalle__error" role="alert">{errorCarrito}</p>}

          {agregado && (
            <p className="detalle__ok">
              Agregada al carrito. <Link to="/carrito">Ver carrito</Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Detalle
