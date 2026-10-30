import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { TemaProvider } from './context/TemaContext.jsx'
import { store } from './store/store.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TemaProvider>
          <AuthProvider>
            <CarritoProvider>
              <App />
            </CarritoProvider>
          </AuthProvider>
        </TemaProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
