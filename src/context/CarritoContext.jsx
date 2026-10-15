import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

const CarritoContext = createContext(null)

// todos los carritos se guardan juntos: { [usuarioId]: [items] }
const leerCarritos = () => {
  try {
    const guardado = localStorage.getItem('carritos')
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

export const CarritoProvider = ({ children }) => {
  const { usuario } = useAuth()
  const [carritos, setCarritos] = useState(leerCarritos)

  const usuarioId = usuario?.id
  // item = { id, casaca, cantidad, precioUnitario } (como ItemCarritoDTO, el subtotal se calcula)
  const items = usuarioId ? carritos[usuarioId] ?? [] : []

  const guardar = (nuevosItems) => {
    const nuevos = { ...carritos, [usuarioId]: nuevosItems }
    setCarritos(nuevos)
    try { localStorage.setItem('carritos', JSON.stringify(nuevos)) } catch { /* sin storage */ }
  }

  const agregar = (casaca, cantidad = 1) => {
    if (!usuarioId) return
    const existente = items.find((i) => i.casaca.id === casaca.id)
    if (existente) {
      const nueva = Math.min(existente.cantidad + cantidad, casaca.stock)
      guardar(items.map((i) => (i.id === existente.id ? { ...i, cantidad: nueva } : i)))
    } else {
      guardar([
        ...items,
        { id: Date.now(), casaca, cantidad: Math.min(cantidad, casaca.stock), precioUnitario: casaca.precio },
      ])
    }
  }

  const cambiarCantidad = (itemId, cantidad) => {
    guardar(items.map((i) => {
      if (i.id !== itemId) return i
      return { ...i, cantidad: Math.max(1, Math.min(cantidad, i.casaca.stock)) }
    }))
  }

  const quitar = (itemId) => guardar(items.filter((i) => i.id !== itemId))
  const vaciar = () => guardar([])

  const total = items.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0)
  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar }}>
      {children}
    </CarritoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCarrito = () => useContext(CarritoContext)
