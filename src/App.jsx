import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Detalle from './pages/Detalle'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <div className="layout">
      <Navbar />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/casacas/:id" element={<Detalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
