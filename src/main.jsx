import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { FavoritosProvider } from './context/FavoritosContext.jsx'
import { TemaProvider } from './context/TemaContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TemaProvider>
        <AuthProvider>
          <CarritoProvider>
            <FavoritosProvider>
              <App />
            </FavoritosProvider>
          </CarritoProvider>
        </AuthProvider>
      </TemaProvider>
    </BrowserRouter>
  </StrictMode>,
)
