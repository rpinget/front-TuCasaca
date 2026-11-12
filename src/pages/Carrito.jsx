import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import CamisetaImg from '../components/CamisetaImg'
import EstadoVacio from '../components/EstadoVacio'
import './Carrito.css'

const formatear = (n) => `$${n.toLocaleString('es-AR')}`

const Carrito = () => {
  const { usuario } = useAuth()
  const {
    items,
    total,
    loading,
    error: errorRedux,
    cambiarCantidad: cambiar,
    quitar: quitarItem,
    vaciar: vaciarTodo,
  } = useCarrito()
  const [error, setError] = useState(null)

  // cada acción puede fallar en el back (ej: stock insuficiente): se muestra el mensaje
  const ejecutar = async (accion) => {
    try {
      setError(null)
      await accion()
    } catch (err) {
      setError(err.message)
    }
  }
  const cambiarCantidad = (id, cantidad) => ejecutar(() => cambiar(id, cantidad))
  const quitar = (id) => ejecutar(() => quitarItem(id))
  const vaciar = () => ejecutar(() => vaciarTodo())

  if (!usuario) {
    return (
      <EstadoVacio
        titulo="Carrito"
        mensaje="Ingresá a tu cuenta para ver tu carrito."
        linkTexto="Ingresar"
        linkTo="/login"
      />
    )
  }

  if (loading && items.length === 0) {
    return <p>Cargando carrito...</p>
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje={errorRedux || "Todavía no agregaste ninguna casaca."}
        linkTexto="Ver casacas"
        linkTo="/"
      />
    )
  }

  const mensajeError = error || errorRedux

  return (
    <section>
      <h1>Carrito</h1>
      {mensajeError && <p className="carrito__error" role="alert">{mensajeError}</p>}

      <div className="carrito">
        <ul className="carrito__lista">
          {items.map((item) => (
            <li key={item.id} className="carrito__item">
              <CamisetaImg casaca={item.casaca} />

              <div className="carrito__datos">
                <Link to={`/casacas/${item.casaca.id}`}>
                  {item.casaca.equipo.nombre} {item.casaca.anio}
                </Link>
                <span>{item.casaca.jugador} #{item.casaca.numero} · Talle {item.casaca.talle}</span>
                <span>{formatear(item.precioUnitario)} c/u</span>
              </div>

              <div className="carrito__cantidad">
                <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1} aria-label="Restar">−</button>
                <span>{item.cantidad}</span>
                <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.casaca.stock} aria-label="Sumar">+</button>
              </div>

              <strong className="carrito__subtotal">
                {formatear(item.precioUnitario * item.cantidad)}
              </strong>

              <button className="carrito__quitar" onClick={() => quitar(item.id)}>Quitar</button>
            </li>
          ))}
        </ul>

        <aside className="carrito__resumen">
          <h2>Resumen</h2>
          <p><span>Productos</span><span>{items.length}</span></p>
          <p className="carrito__total"><span>Total</span><span>{formatear(total)}</span></p>
          <Link to="/checkout" className="carrito__btn">Ir al checkout</Link>
          <button className="carrito__vaciar" onClick={vaciar}>Vaciar carrito</button>
        </aside>
      </div>
    </section>
  )
}

export default Carrito
