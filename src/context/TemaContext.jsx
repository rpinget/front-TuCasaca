import { createContext, useContext, useEffect, useState } from 'react'

const TemaContext = createContext(null)

// tema inicial: el que eligió el usuario, o el del sistema operativo si nunca eligió
const leerTema = () => {
  try {
    const guardado = localStorage.getItem('tema')
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch { /* sin storage */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export const TemaProvider = ({ children }) => {
  const [tema, setTema] = useState(leerTema)

  // useEffect con [tema] -> cada vez que cambia, se refleja en <html data-tema="...">
  // y las variables CSS de index.css hacen el resto
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try { localStorage.setItem('tema', tema) } catch { /* sin storage */ }
  }, [tema])

  const alternar = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))

  return <TemaContext.Provider value={{ tema, alternar }}>{children}</TemaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTema = () => useContext(TemaContext)
