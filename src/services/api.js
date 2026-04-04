import axios from 'axios'

const API_BASE_URL = 'http://localhost:8083/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validateToken: (token) => api.get('/auth/validate', { headers: { Authorization: `Bearer ${token}` } }),
  refreshToken: () => api.post('/auth/refresh'),
}

// Doctor API
export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctorProfile: (id, data) => api.put(`/doctors/${id}`, data),
  getDoctorSchedule: (id) => api.get(`/doctors/${id}/schedule`),
  updateDoctorSchedule: (id, schedule) => api.put(`/doctors/${id}/schedule`, schedule),
  getDoctorAppointments: (id) => api.get(`/doctors/${id}/appointments`),
  updateAppointmentStatus: (appointmentId, status) => api.put(`/appointments/${appointmentId}/status`, { status }),
}

// Patient API
export const patientAPI = {
  getPatientProfile: (id) => api.get(`/patients/${id}`),
  updatePatientProfile: (id, data) => api.put(`/patients/${id}`, data),
  getPatientAppointments: (id) => api.get(`/patients/${id}/appointments`),
  getPatientReports: (id) => api.get(`/patients/${id}/reports`),
  getPatientPrescriptions: (id) => api.get(`/patients/${id}/prescriptions`),
}

// Appointment API
export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
}

// Payment API
export const paymentAPI = {
  processPayment: (data) => api.post('/payments/process', data),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
}

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (doctorId, status) => api.put(`/admin/doctors/${doctorId}/verify`, { status }),
  getAnalytics: () => api.get('/admin/analytics'),
}

// Telemedicine API
export const telemedicineAPI = {
  startConsultation: (appointmentId) => api.post(`/telemedicine/consultation/${appointmentId}/start`),
  endConsultation: (appointmentId) => api.post(`/telemedicine/consultation/${appointmentId}/end`),
  getConsultationLink: (appointmentId) => api.get(`/telemedicine/consultation/${appointmentId}/link`),
}

// AI Symptom Checker API
export const aiAPI = {
  analyzeSymptoms: (symptoms) => api.post('/ai/symptom-checker', { symptoms }),
  getRecommendations: (analysisId) => api.get(`/ai/recommendations/${analysisId}`),
}

export default api
