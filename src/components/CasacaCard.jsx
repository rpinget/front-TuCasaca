import { Link } from 'react-router-dom'
import './CasacaCard.css'

const CasacaCard = ({ casaca }) => {
  const sinStock = casaca.stock === 0

  return (
    <article className="casaca-card">
      <Link to={`/casacas/${casaca.id}`} className="casaca-card__link">
        <img
          src={casaca.imagenUrl}
          alt={`Camiseta ${casaca.equipo.nombre} ${casaca.anio}`}
          className="casaca-card__img"
        />
        <span className="casaca-card__liga">{casaca.liga.nombre}</span>
        <h3>{casaca.equipo.nombre} {casaca.anio}</h3>
        <p>{casaca.jugador} #{casaca.numero} · Talle {casaca.talle}</p>
      </Link>
      <div className="casaca-card__footer">
        <strong>${casaca.precio.toLocaleString('es-AR')}</strong>
        <span className={sinStock ? 'sin-stock' : 'en-stock'}>
          {sinStock ? 'Agotado' : `Stock: ${casaca.stock}`}
        </span>
      </div>
    </article>
  )
}

export default CasacaCard
