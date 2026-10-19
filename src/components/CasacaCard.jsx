import { Link } from 'react-router-dom'
import CamisetaImg from './CamisetaImg'
import FavoritoBtn from './FavoritoBtn'
import './CasacaCard.css'

const CasacaCard = ({ casaca }) => {
  const sinStock = casaca.stock === 0
  const pocasUnidades = casaca.stock > 0 && casaca.stock <= 3

  return (
    <article className="casaca-card">
      <Link to={`/casacas/${casaca.id}`} className="casaca-card__link">
        <div className="casaca-card__media">
          <CamisetaImg casaca={casaca} />
          <span className="casaca-card__anio">{casaca.anio}</span>
          {sinStock && <span className="casaca-card__estado casaca-card__estado--agotada">Agotada</span>}
          {pocasUnidades && <span className="casaca-card__estado">Últimas {casaca.stock}</span>}
        </div>
        <div className="casaca-card__info">
          <div className="casaca-card__fila">
            <h3>{casaca.equipo.nombre}</h3>
            <strong>${casaca.precio.toLocaleString('es-AR')}</strong>
          </div>
          <p>{casaca.jugador} #{casaca.numero} · Talle {casaca.talle}</p>
          <span className="casaca-card__liga">{casaca.liga.nombre}</span>
        </div>
      </Link>
      <FavoritoBtn casacaId={casaca.id} className="favorito--tarjeta" />
    </article>
  )
}

export default CasacaCard
