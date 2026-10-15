import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CasacaCard from '../components/CasacaCard'
import CamisetaImg from '../components/CamisetaImg'
import './Home.css'

const Home = () => {
  const [casacas, setCasacas] = useState([])
  const [ligas, setLigas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // el filtro vive en la URL: /?liga=1  y  /?q=boca (los setea el Navbar)
  const [params] = useSearchParams()
  const ligaId = params.get('liga')
  const q = (params.get('q') ?? '').trim().toLowerCase()

  // useEffect con [] -> se ejecuta una sola vez al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resCasacas, resLigas] = await Promise.all([
          fetch('/data/casacas.json'),
          fetch('/data/ligas.json'),
        ])
        if (!resCasacas.ok || !resLigas.ok) {
          throw new Error('Error al cargar los datos')
        }
        setCasacas(await resCasacas.json())
        setLigas(await resLigas.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  if (loading) return <p>Cargando casacas...</p>
  if (error) return <p>Error: {error}</p>

  const visibles = casacas
    .filter((c) => !ligaId || c.liga.id === Number(ligaId))
    .filter((c) =>
      !q || `${c.equipo.nombre} ${c.jugador} ${c.anio}`.toLowerCase().includes(q)
    )

  const ligaActiva = ligas.find((l) => l.id === Number(ligaId))
  const hayFiltro = Boolean(ligaId || q)

  return (
    <>
      {!hayFiltro && (
        <section className="hero">
          <div className="hero__texto">
            <span className="hero__etiqueta">Camisetas retro y de colección</span>
            <h1 className="hero__titulo">
              La camiseta de <em>tu hinchada</em>
            </h1>
            <p>Las que usaron los ídolos, las que se ven en la tribuna. Elegí la tuya y llevála puesta.</p>
            <a href="#catalogo" className="hero__btn">Ver la colección</a>
          </div>
          <div className="hero__visual" aria-hidden="true">
            {casacas.slice(0, 3).map((c, i) => (
              <div key={c.id} className={`hero__camiseta hero__camiseta--${i + 1}`}>
                <CamisetaImg casaca={c} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="catalogo">
      <h2 className="home__titulo">{ligaActiva ? ligaActiva.nombre : 'La colección'}</h2>

      {hayFiltro && (
        <p className="home__filtro">
          {visibles.length} resultado(s){q && <> para "{q}"</>} · <Link to="/">Limpiar filtros</Link>
        </p>
      )}

      {visibles.length === 0 ? (
        <p>No encontramos casacas con ese criterio.</p>
      ) : (
        <div className="home__grid">
          {visibles.map((casaca) => (
            <CasacaCard key={casaca.id} casaca={casaca} />
          ))}
        </div>
      )}
      </section>
    </>
  )
}

export default Home
