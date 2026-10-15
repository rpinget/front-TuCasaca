import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  // estado del menú en pantallas chicas (abierto/cerrado)
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo" onClick={cerrar}>TuCasaca</Link>
      <button
        className="navbar__toggle"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir menú"
      >
        ☰
      </button>
      <nav className={abierto ? 'navbar__links navbar__links--abierto' : 'navbar__links'}>
        <NavLink to="/" onClick={cerrar}>Inicio</NavLink>
        <NavLink to="/carrito" onClick={cerrar}>Carrito</NavLink>
        <NavLink to="/admin" onClick={cerrar}>Admin</NavLink>
        <NavLink to="/login" onClick={cerrar}>Ingresar</NavLink>
        <NavLink to="/registro" onClick={cerrar}>Registrarse</NavLink>
      </nav>
    </header>
  )
}

export default Navbar
