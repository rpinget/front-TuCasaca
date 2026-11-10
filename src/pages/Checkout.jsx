import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import Campo from '../components/Campo'
import './Carrito.css'
import './Checkout.css'

const formatear = (n) => `$${n.toLocaleString('es-AR')}`

const Checkout = () => {
  const { usuario } = useAuth()
  const { items, total, finalizarCompra } = useCarrito()
  const [confirmada, setConfirmada] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    nombre: usuario ? `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() : '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  })
  const [errores, setErrores] = useState({})

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
        <p>Gracias {form.nombre || usuario.nombre}. Total abonado: <strong>{formatear(confirmada.total)}</strong></p>
        <p>{confirmada.cantidad} producto(s) comprados con envío a <strong>{form.direccion} ({form.ciudad}, CP {form.codigoPostal})</strong>.</p>
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

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: null })
    }
  }

  const validar = () => {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Ingresá tu nombre y apellido'
    if (!form.direccion.trim()) err.direccion = 'Ingresá tu dirección de envío'
    if (!form.ciudad.trim()) err.ciudad = 'Ingresá la ciudad'
    if (!form.codigoPostal.trim()) err.codigoPostal = 'Ingresá el código postal'
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const confirmar = async (e) => {
    e.preventDefault()
    if (!validar()) return

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
      <h1>Confirmar compra</h1>
      <form className="carrito" onSubmit={confirmar} noValidate>
        <div className="checkout__principal">
          <div className="checkout__envio">
            <h2>Datos de envío</h2>
            <Campo
              id="nombre"
              label="Nombre y apellido"
              placeholder="Ej: Juan Pérez"
              autoComplete="name"
              form={form}
              errores={errores}
              cambiar={cambiar}
            />
            <Campo
              id="direccion"
              label="Dirección de envío"
              placeholder="Ej: Av. Rivadavia 1234, 4° B"
              autoComplete="street-address"
              form={form}
              errores={errores}
              cambiar={cambiar}
            />
            <div className="checkout__fila">
              <Campo
                id="ciudad"
                label="Ciudad"
                placeholder="Ej: Buenos Aires"
                autoComplete="address-level2"
                form={form}
                errores={errores}
                cambiar={cambiar}
              />
              <Campo
                id="codigoPostal"
                label="Código postal"
                placeholder="Ej: 1406"
                autoComplete="postal-code"
                form={form}
                errores={errores}
                cambiar={cambiar}
              />
            </div>
          </div>

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
        </div>

        <aside className="carrito__resumen">
          <h2>Total a pagar</h2>
          <p className="carrito__total"><span>Total</span><span>{formatear(total)}</span></p>
          {error && <p className="carrito__error" role="alert">{error}</p>}
          <button className="carrito__btn" type="submit" disabled={enviando}>
            {enviando ? 'Procesando...' : 'Confirmar compra'}
          </button>
          <Link to="/carrito" className="carrito__vaciar">Volver al carrito</Link>
        </aside>
      </form>
    </section>
  )
}

export default Checkout
