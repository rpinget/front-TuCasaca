import { createSlice } from '@reduxjs/toolkit'

// Los favoritos viven SOLO en memoria: al recargar la página se pierden.
// Se guarda la casaca completa (no el id) para poder mostrar /favoritos sin
// volver a pedir el catálogo al back.
const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {
    items: [], // [{ id, equipo, liga, precio, stock, ... }]
  },

  reducers: {
    // toggleFavorite = addFavorite + removeFavorite en una sola acción.
    // El corazón (FavoritoBtn) no sabe si la casaca está marcada: solo despacha
    // y el reducer decide. Si ya estaba en la lista la saca; si no estaba la agrega.
    toggleFavorite: (state, action) => {
      const casaca = action.payload
      const existe = state.items.some((c) => c.id === casaca.id)
      state.items = existe
        ? state.items.filter((c) => c.id !== casaca.id)
        : [...state.items, casaca]
    },

    clearFavorites: (state) => {
      state.items = []
    },
  },
})

export const { toggleFavorite, clearFavorites } = favoriteSlice.actions

export default favoriteSlice.reducer
