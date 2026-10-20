import { Link } from 'react-router-dom'
import './Carrito.css'
import './NotFound.css'

// Ruta "*": se muestra cuando la dirección no existe
const NotFound = () => {
  return (
    <section className="notfound">
      <h1 className="notfound__codigo">404</h1>
      <p>Esta página no existe</p>
      <Link to="/" className="carrito__btn">Volver al inicio</Link>
    </section>
  )
}

export default NotFound
