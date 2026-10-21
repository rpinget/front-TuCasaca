import { Link } from 'react-router-dom'
import './EstadoVacio.css'

// Componente reutilizable para estados vacíos (búsquedas sin resultados, listas vacías).
// - Recibe titulo y mensaje descriptivo por props.
// - Si se provee linkTo y linkTexto, muestra un botón/enlace de acción directa.
// - Permite pasar children para acciones o contenido personalizado adicional.
const EstadoVacio = ({ titulo, mensaje, linkTexto, linkTo, children }) => (
  <section className="estado-vacio">
    <h2 className="estado-vacio__titulo">{titulo}</h2>
    {mensaje && <p className="estado-vacio__mensaje">{mensaje}</p>}
    {linkTo && linkTexto && (
      <Link to={linkTo} className="estado-vacio__btn">
        {linkTexto}
      </Link>
    )}
    {children}
  </section>
)

export default EstadoVacio
