import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Necesario para que el hot reload funcione con volúmenes montados desde Windows
    watch: { usePolling: true },
  },
})
