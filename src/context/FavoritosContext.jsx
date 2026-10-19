import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

const FavoritosContext = createContext(null)

// todos los favoritos se guardan juntos: { [usuarioId | 'invitado']: [idCasaca, ...] }
const leerFavoritos = () => {
  try {
    const guardado = localStorage.getItem('favoritos')
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

export const FavoritosProvider = ({ children }) => {
  const { usuario } = useAuth()
  const [todos, setTodos] = useState(leerFavoritos)

  // cada usuario tiene su lista; sin sesión se usa una lista de "invitado"
  const clave = usuario?.id ?? 'invitado'
  const ids = todos[clave] ?? []

  const esFavorita = (casacaId) => ids.includes(casacaId)

  const alternar = (casacaId) => {
    // forma funcional: siempre parte del estado más reciente, aunque se toquen dos corazones seguidos
    setTodos((previos) => {
      const actuales = previos[clave] ?? []
      const nuevosIds = actuales.includes(casacaId)
        ? actuales.filter((i) => i !== casacaId)
        : [...actuales, casacaId]
      const nuevos = { ...previos, [clave]: nuevosIds }
      try { localStorage.setItem('favoritos', JSON.stringify(nuevos)) } catch { /* sin storage */ }
      return nuevos
    })
  }

  return (
    <FavoritosContext.Provider value={{ ids, cantidad: ids.length, esFavorita, alternar }}>
      {children}
    </FavoritosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFavoritos = () => useContext(FavoritosContext)
