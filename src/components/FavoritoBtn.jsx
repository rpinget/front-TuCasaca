import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '../store/slices/favoriteSlice'
import './FavoritoBtn.css'

// corazón para marcar / desmarcar una casaca como favorita
const FavoritoBtn = ({ casaca, className = '' }) => {
  const dispatch = useDispatch()
  // se suscribe solo a este pedacito del store: se re-renderiza si cambia la lista
  const activa = useSelector((state) => state.favorite.items.some((c) => c.id === casaca.id))

  return (
    <button
      type="button"
      className={`favorito ${activa ? 'favorito--activo' : ''} ${className}`}
      onClick={() => dispatch(toggleFavorite(casaca))}
      aria-pressed={activa}
      aria-label={activa ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  )
}

export default FavoritoBtn
