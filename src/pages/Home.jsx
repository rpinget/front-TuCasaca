import { useState, useEffect } from 'react'
import CasacaCard from '../components/CasacaCard'
import './Home.css'

const Home = () => {
  const [casacas, setCasacas] = useState([])
  const [ligas, setLigas] = useState([])
  const [ligaId, setLigaId] = useState('')      // filtro por liga ('' = todas)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const visibles = ligaId
    ? casacas.filter((c) => c.liga.id === Number(ligaId))
    : casacas

  return (
    <section>
      <h1>Casacas</h1>

      <div className="home__filtros">
        <label htmlFor="liga">Liga: </label>
        <select id="liga" value={ligaId} onChange={(e) => setLigaId(e.target.value)}>
          <option value="">Todas</option>
          {ligas.map((liga) => (
            <option key={liga.id} value={liga.id}>{liga.nombre}</option>
          ))}
        </select>
      </div>

      {visibles.length === 0 ? (
        <p>No hay casacas para esta liga.</p>
      ) : (
        <div className="home__grid">
          {visibles.map((casaca) => (
            <CasacaCard key={casaca.id} casaca={casaca} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Home
