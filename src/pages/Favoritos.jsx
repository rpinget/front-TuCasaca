import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CasacaCard from '../components/CasacaCard'
import { useFavoritos } from '../context/FavoritosContext'
import { getCasacas } from '../services/api'
import './Home.css'
import './Carrito.css'

const Favoritos = () => {
  const { ids } = useFavoritos()
  const [casacas, setCasacas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect con [] -> trae el catálogo una vez; después se filtran las favoritas
  // (GET /api/casacas). Los ids de favoritos viven en el navegador.
  useEffect(() => {
    const cargar = async () => {
      try {
        setCasacas(await getCasacas())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return <p>Cargando favoritos...</p>
  if (error) return <p>Error: {error}</p>

  const favoritas = casacas.filter((c) => c.activo !== false && ids.includes(c.id))

  if (favoritas.length === 0) {
    return (
      <section className="carrito__vacio">
        <h1>Todavía no tenés favoritos</h1>
        <p>Tocá el corazón de una casaca para guardarla acá.</p>
        <Link to="/" className="carrito__btn">Ver casacas</Link>
      </section>
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
