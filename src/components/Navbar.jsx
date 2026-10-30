import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { useTema } from '../context/TemaContext'
import { getLigas } from '../services/api'
import './Navbar.css'

const Navbar = () => {
  const { usuario, esAdmin, logout } = useAuth()
  const { cantidadTotal } = useCarrito()
  const cantidadFavoritos = useSelector((state) => state.favorite.items.length)
  const { tema, alternar: alternarTema } = useTema()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [ligas, setLigas] = useState([])
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '')
  const [menuUsuario, setMenuUsuario] = useState(false)
  const [menuMovil, setMenuMovil] = useState(false)

  // useEffect con [] -> corre una sola vez al montar. Las ligas son las
  // "categorías" de la barra inferior (GET /api/ligas).
  useEffect(() => {
    const cargarLigas = async () => {
      try {
        const data = await getLigas()
        setLigas(data)
      } catch {
        setLigas([])
      }
    }
    cargarLigas()
  }, [])

  const cerrarMenus = () => {
    setMenuUsuario(false)
    setMenuMovil(false)
  }

  const buscar = (e) => {
    e.preventDefault()
    const q = busqueda.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
    cerrarMenus()
  }

  const salir = () => {
    logout()
    cerrarMenus()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar__aviso">Envíos a todo el país · Cambios sin vueltas</div>

      <div className="navbar__top">
        <Link to="/" className="navbar__logo" onClick={cerrarMenus}>
          tucasaca<i className="navbar__logo-punto" />
        </Link>

        <form className="navbar__search" onSubmit={buscar} role="search">
          <input
            type="search"
            placeholder="Buscar equipo, jugador o año..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar casacas"
          />
          <button type="submit" aria-label="Buscar">Buscar</button>
        </form>

        <div className="navbar__acciones">
          {usuario ? (
            <div className="navbar__usuario">
              <button className="navbar__usuario-btn" onClick={() => setMenuUsuario(!menuUsuario)}>
                {usuario.nombre} ▾
              </button>
              {menuUsuario && (
                <div className="navbar__dropdown">
                  <Link to="/perfil" onClick={cerrarMenus}>Mi perfil</Link>
                  <Link to="/carrito" onClick={cerrarMenus}>Mi carrito</Link>
                  <Link to="/favoritos" onClick={cerrarMenus}>Mis favoritos</Link>
                  {esAdmin && <Link to="/admin" onClick={cerrarMenus}>Panel de administración</Link>}
                  <button onClick={salir}>Salir</button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__sesion">
              <Link to="/registro" className="navbar__cta" onClick={cerrarMenus}>Creá tu cuenta</Link>
              <Link to="/login" onClick={cerrarMenus}>Ingresá</Link>
            </div>
          )}

          <button className="navbar__icono" onClick={alternarTema} aria-label={tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}>
            {tema === 'oscuro' ? '☀' : '☾'}
          </button>

          <Link to="/favoritos" className="navbar__carrito" aria-label="Favoritos" onClick={cerrarMenus}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {cantidadFavoritos > 0 && <span className="navbar__badge">{cantidadFavoritos}</span>}
          </Link>

          <Link to="/carrito" className="navbar__carrito" aria-label="Carrito" onClick={cerrarMenus}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {cantidadTotal > 0 && <span className="navbar__badge">{cantidadTotal}</span>}
          </Link>

          <button className="navbar__toggle" onClick={() => setMenuMovil(!menuMovil)} aria-label="Abrir categorías">
            ☰
          </button>
        </div>
      </div>

      <nav className={menuMovil ? 'navbar__cats navbar__cats--abierto' : 'navbar__cats'}>
        <NavLink to="/" end onClick={cerrarMenus}>Todas</NavLink>
        {ligas.map((liga) => (
          <Link key={liga.id} to={`/?liga=${liga.id}`} onClick={cerrarMenus}>{liga.nombre}</Link>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
