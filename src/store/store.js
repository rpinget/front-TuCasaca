// Tienda global de Redux (mismo patrón que reduxProfe/src/store/store.js).
// configureStore agrupa todos los slices (estados globales) en un solo objeto.
import { configureStore } from '@reduxjs/toolkit'
import favoriteSlice from './slices/favoriteSlice'
import cartSlice from './slices/cartSlice'
import authSlice from './slices/authSlice'

export const store = configureStore({
  reducer: {
    favorite: favoriteSlice, // favoritos: toggleFavorite / clearFavorites
    cart: cartSlice,         // carrito: fetchCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCart
    auth: authSlice,         // autenticación: loginUser, logout, setUsuario
  },
})
