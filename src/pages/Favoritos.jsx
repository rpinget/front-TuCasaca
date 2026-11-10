import { useSelector } from 'react-redux'
import CasacaCard from '../components/CasacaCard'
import EstadoVacio from '../components/EstadoVacio'
import './Home.css'
import './Carrito.css'

const Favoritos = () => {
  // los favoritos ya tienen la casaca completa en el store: no hace falta
  // volver a pedir el catálogo al back (GET /api/casacas)
  const items = useSelector((state) => state.favorite.items)
  const favoritas = items.filter((c) => c.activo !== false)

  if (favoritas.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no tenés favoritos"
        mensaje="Tocá el corazón de una casaca para guardarla acá."
        linkTexto="Ver casacas"
        linkTo="/"
      />
    )
  }

  return (
    <section>
      <h1 className="home__titulo">Tus favoritos</h1>
      <p className="home__filtro">{favoritas.length} casaca(s) guardada(s)</p>
      <div className="home__grid">
        {favoritas.map((casaca) => <CasacaCard key={casaca.id} casaca={casaca} />)}
      </div>
    </section>
  )
}

export default Favoritos
