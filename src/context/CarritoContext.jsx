import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  esSesionMock, getCarrito, agregarItem, quitarItem, vaciarCarrito, confirmarCompra,
} from '../services/api'

const CarritoContext = createContext(null)

// Hay dos modos, según cómo se inició sesión:
// - sesión REAL (token del back): el carrito vive en el back (/api/carritos/{usuarioId}).
// - sesión MOCK (login sin back): el carrito se guarda en localStorage, uno por usuario.

// carritos del modo mock, todos juntos: { [usuarioId]: [items] }
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
  const [itemsRemotos, setItemsRemotos] = useState([])

  const usuarioId = usuario?.id
  const remoto = Boolean(usuario) && !esSesionMock(usuario)

  // useEffect con [usuarioId, remoto] -> al iniciar / cambiar la sesión, trae el
  // carrito del usuario desde el back (GET /api/carritos/{usuarioId})
  useEffect(() => {
    if (!remoto) {
      setItemsRemotos([])
      return
    }
    let vigente = true
    const cargar = async () => {
      try {
        const carrito = await getCarrito(usuario)
        if (vigente) setItemsRemotos(carrito.items)
      } catch {
        if (vigente) setItemsRemotos([])
      }
    }
    cargar()
    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, remoto])

  // item = { id, casaca, cantidad, precioUnitario } (como ItemCarritoDTO, el subtotal se calcula)
  const items = remoto ? itemsRemotos : (usuarioId ? carritos[usuarioId] ?? [] : [])

  const guardarLocal = (nuevosItems) => {
    const nuevos = { ...carritos, [usuarioId]: nuevosItems }
    setCarritos(nuevos)
    try { localStorage.setItem('carritos', JSON.stringify(nuevos)) } catch { /* sin storage */ }
  }

  // Todas las acciones son async: en modo real esperan al back y, si falla
  // (ej: "Stock insuficiente"), lanzan un Error con el mensaje para que la pantalla lo muestre.

  const agregar = async (casaca, cantidad = 1) => {
    if (!usuarioId) return
    if (remoto) {
      const carrito = await agregarItem(usuario, casaca.id, cantidad)
      setItemsRemotos(carrito.items)
      return
    }
    const existente = items.find((i) => i.casaca.id === casaca.id)
    if (existente) {
      const nueva = Math.min(existente.cantidad + cantidad, casaca.stock)
      guardarLocal(items.map((i) => (i.id === existente.id ? { ...i, cantidad: nueva } : i)))
    } else {
      guardarLocal([
        ...items,
        { id: Date.now(), casaca, cantidad: Math.min(cantidad, casaca.stock), precioUnitario: casaca.precio },
      ])
    }
  }

  const cambiarCantidad = async (itemId, cantidad) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const nueva = Math.max(1, Math.min(cantidad, item.casaca.stock))
    if (remoto) {
      // el back solo sabe sumar o quitar ítems: si sube, suma la diferencia;
      // si baja, quita el ítem y lo vuelve a agregar con la cantidad nueva
      if (nueva > item.cantidad) {
        const carrito = await agregarItem(usuario, item.casaca.id, nueva - item.cantidad)
        setItemsRemotos(carrito.items)
      } else if (nueva < item.cantidad) {
        await quitarItem(usuario, itemId)
        const carrito = await agregarItem(usuario, item.casaca.id, nueva)
        setItemsRemotos(carrito.items)
      }
      return
    }
    guardarLocal(items.map((i) => (i.id === itemId ? { ...i, cantidad: nueva } : i)))
  }

  const quitar = async (itemId) => {
    if (remoto) {
      const carrito = await quitarItem(usuario, itemId)
      setItemsRemotos(carrito.items)
      return
    }
    guardarLocal(items.filter((i) => i.id !== itemId))
  }

  const vaciar = async () => {
    if (remoto) {
      const carrito = await vaciarCarrito(usuario)
      setItemsRemotos(carrito.items)
      return
    }
    guardarLocal([])
  }

  // Confirma la compra. En modo real descuenta el stock y cierra el carrito en el back
  // (POST /api/carritos/{usuarioId}/checkout). Devuelve el resumen para mostrar en pantalla.
  const finalizarCompra = async () => {
    const resumen = { total, cantidad: items.length }
    if (remoto) {
      await confirmarCompra(usuario)
      setItemsRemotos([])
    } else {
      guardarLocal([])
    }
    return resumen
  }

  const total = items.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0)
  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{ items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar, finalizarCompra }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCarrito = () => useContext(CarritoContext)
