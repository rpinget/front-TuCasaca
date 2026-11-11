import { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from './AuthContext'
import {
  esSesionMock, getCarrito, agregarItem, quitarItem, vaciarCarrito, confirmarCompra,
} from '../services/api'
import {
  setCartItems, addCartItem, updateCartItemQuantity, removeCartItem, clearCart,
} from '../store/slices/cartSlice'

const CarritoContext = createContext(null)

// El estado de los ítems vive en Redux (store.cart.items).
// Hay dos modos de persistencia según cómo se inició sesión:
// - sesión REAL (token del back): se sincroniza con /api/carritos/{usuarioId}.
// - sesión MOCK (login sin back): se sincroniza con localStorage, un carrito por usuario.

const leerCarritosLocal = () => {
  try {
    const guardado = localStorage.getItem('carritos')
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

const guardarCarritoLocal = (usuarioId, nuevosItems) => {
  if (!usuarioId) return
  try {
    const actuales = leerCarritosLocal()
    localStorage.setItem('carritos', JSON.stringify({ ...actuales, [usuarioId]: nuevosItems }))
  } catch { /* sin storage */ }
}

export const CarritoProvider = ({ children }) => {
  const { usuario } = useAuth()
  const dispatch = useDispatch()
  // item = { id, casaca, cantidad, precioUnitario } (como ItemCarritoDTO, el subtotal se calcula)
  const items = useSelector((state) => state.cart.items)

  const usuarioId = usuario?.id
  const remoto = Boolean(usuario) && !esSesionMock(usuario)

  // useEffect con [usuarioId, remoto] -> al iniciar / cambiar la sesión, carga el
  // carrito del usuario en el store de Redux (desde el back o desde localStorage)
  useEffect(() => {
    if (!usuarioId) {
      dispatch(clearCart())
      return
    }
    if (!remoto) {
      const guardados = leerCarritosLocal()[usuarioId] ?? []
      dispatch(setCartItems(guardados))
      return
    }
    let vigente = true
    const cargar = async () => {
      try {
        const carrito = await getCarrito(usuario)
        if (vigente) dispatch(setCartItems(carrito.items))
      } catch {
        if (vigente) dispatch(clearCart())
      }
    }
    cargar()
    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, remoto])

  // Todas las acciones son async: en modo real esperan al back y, si falla
  // (ej: "Stock insuficiente"), lanzan un Error con el mensaje para que la pantalla lo muestre.

  const agregar = async (casaca, cantidad = 1) => {
    if (!usuarioId) return
    if (remoto) {
      const carrito = await agregarItem(usuario, casaca.id, cantidad)
      dispatch(setCartItems(carrito.items))
      return
    }
    const existente = items.find((i) => i.casaca.id === casaca.id)
    const nueva = (existente?.cantidad ?? 0) + cantidad
    if (nueva > casaca.stock) {
      throw new Error(`Stock insuficiente para la cantidad total. Disponible: ${casaca.stock}`)
    }
    dispatch(addCartItem({ casaca, cantidad }))
    const actualizados = existente
      ? items.map((i) => (i.id === existente.id ? { ...i, cantidad: nueva } : i))
      : [...items, { id: Date.now(), casaca, cantidad, precioUnitario: casaca.precio }]
    guardarCarritoLocal(usuarioId, actualizados)
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
        dispatch(setCartItems(carrito.items))
      } else if (nueva < item.cantidad) {
        await quitarItem(usuario, itemId)
        const carrito = await agregarItem(usuario, item.casaca.id, nueva)
        dispatch(setCartItems(carrito.items))
      }
      return
    }
    dispatch(updateCartItemQuantity({ itemId, cantidad: nueva }))
    guardarCarritoLocal(
      usuarioId,
      items.map((i) => (i.id === itemId ? { ...i, cantidad: nueva } : i)),
    )
  }

  const quitar = async (itemId) => {
    if (remoto) {
      const carrito = await quitarItem(usuario, itemId)
      dispatch(setCartItems(carrito.items))
      return
    }
    dispatch(removeCartItem(itemId))
    guardarCarritoLocal(usuarioId, items.filter((i) => i.id !== itemId))
  }

  const vaciar = async () => {
    if (remoto) {
      const carrito = await vaciarCarrito(usuario)
      dispatch(setCartItems(carrito.items))
      return
    }
    dispatch(clearCart())
    guardarCarritoLocal(usuarioId, [])
  }

  // Confirma la compra. En modo real descuenta el stock y cierra el carrito en el back
  // (POST /api/carritos/{usuarioId}/checkout). Devuelve el resumen para mostrar en pantalla.
  const finalizarCompra = async () => {
    const resumen = { total, cantidad: items.length }
    if (remoto) {
      await confirmarCompra(usuario)
    } else {
      guardarCarritoLocal(usuarioId, [])
    }
    dispatch(clearCart())
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
