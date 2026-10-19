import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import './Carrito.css'
import './Checkout.css'

const formatear = (n) => `$${n.toLocaleString('es-AR')}`

const Checkout = () => {
  const { usuario } = useAuth()
  const { items, total, finalizarCompra } = useCarrito()
  const [confirmada, setConfirmada] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  if (!usuario) {
    return (
      <section className="carrito__vacio">
        <h1>Checkout</h1>
        <p>Ingresá a tu cuenta para finalizar la compra.</p>
        <Link to="/login" className="carrito__btn">Ingresar</Link>
      </section>
    )
  }

  if (confirmada) {
    return (
      <section className="carrito__vacio">
        <h1>¡Compra realizada!</h1>
        <p>Gracias {usuario.nombre}. Total abonado: <strong>{formatear(confirmada.total)}</strong></p>
        <p>{confirmada.cantidad} producto(s) comprados.</p>
        <Link to="/" className="carrito__btn">Seguir comprando</Link>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="carrito__vacio">
        <h1>No hay nada para pagar</h1>
        <p>Tu carrito está vacío.</p>
        <Link to="/" className="carrito__btn">Ver casacas</Link>
      </section>
    )
  }

  const confirmar = async () => {
    // con sesión real: POST /api/carritos/{usuarioId}/checkout (descuenta stock y cierra el carrito)
    try {
      setEnviando(true)
      setError(null)
      setConfirmada(await finalizarCompra())
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section>
      <h1>Checkout</h1>
      <div className="carrito">
        <div className="checkout__detalle">
          <h2>Tu pedido</h2>
          <ul className="checkout__lista">
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.cantidad} × {item.casaca.equipo.nombre} {item.casaca.anio} (Talle {item.casaca.talle})</span>
                <strong>{formatear(item.precioUnitario * item.cantidad)}</strong>
              </li>
            ))}
          </ul>
          <p className="checkout__cuenta">Comprás como <strong>{usuario.nombre}</strong> ({usuario.email})</p>
        </div>

        <aside className="carrito__resumen">
          <h2>Total a pagar</h2>
          <p className="carrito__total"><span>Total</span><span>{formatear(total)}</span></p>
          {error && <p className="carrito__error" role="alert">{error}</p>}
          <button className="carrito__btn" onClick={confirmar} disabled={enviando}>
            {enviando ? 'Procesando...' : 'Confirmar compra'}
          </button>
          <Link to="/carrito" className="carrito__vaciar">Volver al carrito</Link>
        </aside>
      </div>
    </section>
  )
}

export default Checkout
