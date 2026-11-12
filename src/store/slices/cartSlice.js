import { createSlice } from '@reduxjs/toolkit'

// Estado global del carrito en Redux.
// Cada ítem respeta la forma de ItemCarritoDTO del back:
// { id, casaca, cantidad, precioUnitario }
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },

  reducers: {
    // Reemplaza la lista completa (al cargar el carrito del back o de localStorage)
    setCartItems: (state, action) => {
      state.items = action.payload
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
    },
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

