import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCarrito, agregarItem, quitarItem } from '../../services/api'

// Thunk asíncrono para cargar el carrito de un usuario desde el backend (GET).
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

// Thunk asíncrono para agregar un ítem al carrito en el backend (POST /api/carritos/{usuarioId}/items).
// Impacta directamente en la base de datos MySQL (tabla items_carrito).
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ usuario, casacaId, cantidad = 1 }, { rejectWithValue }) => {
    try {
      const data = await agregarItem(usuario, casacaId, cantidad)
      return data.items ?? []
    } catch (err) {
      return rejectWithValue(err.message || 'Error al agregar la casaca al carrito')
    }
  },
)

// Thunk asíncrono para eliminar un ítem del carrito en el backend (DELETE /api/carritos/{usuarioId}/items/{itemId}).
export const remFromCart = createAsyncThunk(
  'cart/remFromCart',
  async ({ usuario, itemId }, { rejectWithValue }) => {
    try {
      const data = await quitarItem(usuario, itemId)
      return data.items ?? []
    } catch (err) {
      return rejectWithValue(err.message || 'Error al eliminar el ítem del carrito')
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
    // Reemplaza la lista completa (al cargar el carrito o en mock)
    setCartItems: (state, action) => {
      state.items = action.payload
      state.loading = false
      state.error = null
    },

    // Agrega una casaca localmente (modo mock sin backend)
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

    // Cambia la cantidad de un ítem existente localmente
    updateCartItemQuantity: (state, action) => {
      const { itemId, cantidad } = action.payload
      const item = state.items.find((i) => i.id === itemId)
      if (item) {
        item.cantidad = cantidad
      }
    },

    // Quita un ítem por su id localmente
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
      // 1. fetchCart (GET)
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Error al obtener el carrito'
      })

      // 2. addToCart (POST)
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Error al agregar al carrito'
      })

      // 3. remFromCart (DELETE)
      .addCase(remFromCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(remFromCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(remFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message || 'Error al eliminar del carrito'
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
