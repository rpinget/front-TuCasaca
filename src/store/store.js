// Tienda global de Redux (mismo patrón que reduxProfe/src/store/store.js).
// configureStore agrupa todos los slices (estados globales) en un solo objeto.
import { configureStore } from '@reduxjs/toolkit'
import favoriteSlice from './slices/favoriteSlice'

export const store = configureStore({
  reducer: {
    favorite: favoriteSlice, // favoritos: toggleFavorite (agrega o quita)
    // cart: cartSlice,       // el carrito sigue en CarritoContext
  },
})
