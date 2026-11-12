import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCarrito } from '../../services/api'

// Thunk asíncrono para cargar el carrito desde el backend.
// Dispara automáticamente las acciones:
// - fetchCart.pending
// - fetchCart.fulfilled
// - fetchCart.rejected
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (usuario, { rejectWithValue }) => {
    try {
      const data = await getCarrito(usuario)
      return data.items ?? []
    } catch (err) {
      return rejectWithValue(err.message || 'Error al cargar el carrito')
    }
  },
)

// Estado global del carrito en Redux.
// Cada ítem respeta la forma de ItemCarritoDTO del back:
// { id, casaca, cantidad, precioUnitario }
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    // Reemplaza la lista completa (al cargar el carrito del back o de localStorage)
    setCartItems: (state, action) => {
      state.items = action.payload
      state.loading = false
      state.error = null
    },

    // Agrega una casaca o suma cantidad si ya estaba en el carrito
    addCartItem: (state, action) => {
      const { casaca, cantidad } = action.payload
      const existente = state.items.find((i) => i.casaca.id === casaca.id)
      if (existente) {
        existente.cantidad += cantidad
      } else {
        state.items.push({
          id: Date.now(),
          casaca,
          cantidad,
          precioUnitario: casaca.precio,
        })
      }
    },

    // Cambia la cantidad de un ítem existente
    updateCartItemQuantity: (state, action) => {
      const { itemId, cantidad } = action.payload
      const item = state.items.find((i) => i.id === itemId)
      if (item) {
        item.cantidad = cantidad
      }
    },

    // Quita un ítem por su id
    removeCartItem: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter((i) => i.id !== itemId)
    },

    // Vacía el carrito por completo
    clearCart: (state) => {
      state.items = []
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      // 1. PENDING: La promesa está en vuelo -> activamos spinner y limpiamos error previo
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // 2. FULFILLED: La promesa se resolvió exitosamente -> guardamos los ítems y apagamos loading
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      // 3. REJECTED: La promesa falló (401, error de red, etc.) -> apagamos loading y guardamos el error
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Error al obtener el carrito'
      })
  },
})

export const {
  setCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer


