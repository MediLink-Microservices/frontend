import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTargets = {
    '/api/auth': {
      target: env.VITE_AUTH_PROXY_TARGET || 'http://localhost:8081',
      rewrite: (path) => path.replace(/^\/api\/auth/, '/auth')
    },
    '/api/doctors': env.VITE_DOCTOR_PROXY_TARGET || 'http://localhost:8083',
    '/api/hospitals': env.VITE_DOCTOR_PROXY_TARGET || 'http://localhost:8083',
    '/api/prescriptions': env.VITE_DOCTOR_PROXY_TARGET || 'http://localhost:8083',
    '/api/schedules': env.VITE_DOCTOR_PROXY_TARGET || 'http://localhost:8083',
    '/api/appointments': env.VITE_APPOINTMENT_PROXY_TARGET || 'http://localhost:8084',
    '/api/payments': env.VITE_PAYMENT_PROXY_TARGET || 'http://localhost:8085',
    '/api/patient': env.VITE_PATIENT_PROXY_TARGET || 'http://localhost:8086',
    '/api/patients': env.VITE_PATIENT_PROXY_TARGET || 'http://localhost:8086',
    '/api/notifications': env.VITE_NOTIFICATION_PROXY_TARGET || 'http://localhost:8087',
    '/api/telemedicine': env.VITE_TELEMEDICINE_PROXY_TARGET || 'http://localhost:8088',
    '/api/admin': env.VITE_AI_SYMPTOM_PROXY_TARGET || 'http://localhost:8089'
  }

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: Object.fromEntries(
        Object.entries(proxyTargets).map(([path, targetConfig]) => [
          path,
          typeof targetConfig === 'string'
            ? {
                target: targetConfig,
                changeOrigin: true,
                secure: false
              }
            : {
                changeOrigin: true,
                secure: false,
                ...targetConfig
              }
        ])
      )
    }
  }
})
