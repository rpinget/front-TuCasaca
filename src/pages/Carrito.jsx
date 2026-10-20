import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import CamisetaImg from '../components/CamisetaImg'
import './Carrito.css'

const formatear = (n) => `$${n.toLocaleString('es-AR')}`

const Carrito = () => {
  const { usuario } = useAuth()
  const { items, total, cambiarCantidad: cambiar, quitar: quitarItem, vaciar: vaciarTodo } = useCarrito()
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
      <section className="carrito__vacio">
        <h1>Carrito</h1>
        <p>Ingresá a tu cuenta para ver tu carrito.</p>
        <Link to="/login" className="carrito__btn">Ingresar</Link>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="carrito__vacio">
        <h1>Tu carrito está vacío</h1>
        <p>Todavía no agregaste ninguna casaca.</p>
        <Link to="/" className="carrito__btn">Ver casacas</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Carrito</h1>
      {error && <p className="carrito__error" role="alert">{error}</p>}

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
