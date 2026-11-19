// Tienda global de Redux (mismo patrón que reduxProfe/src/store/store.js).
// configureStore agrupa todos los slices (estados globales) en un solo objeto.
import { configureStore } from '@reduxjs/toolkit'
import favoriteSlice, { clearFavorites } from './slices/favoriteSlice'
import cartSlice from './slices/cartSlice'
import authSlice, { sesionExpirada } from './slices/authSlice'
import { onSesionExpirada } from '../services/api'

export const store = configureStore({
  reducer: {
    favorite: favoriteSlice, // favoritos: toggleFavorite / clearFavorites
    cart: cartSlice,         // carrito: fetchCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCart
    auth: authSlice,         // autenticación: loginUser, logout, setUsuario
  },
})

onSesionExpirada(() => {
  store.dispatch(sesionExpirada())
  store.dispatch(clearFavorites())
})
