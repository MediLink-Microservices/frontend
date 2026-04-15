import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      },
      '/api/doctors': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/api/hospitals': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/api/prescriptions': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/api/schedules': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/api/appointments': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false
      },
      '/api/payments': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false
      },
      '/api/patients': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false
      },
      '/api/notifications': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        secure: false
      },
      '/api/telemedicine': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false
      },
      '/api/admin': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
