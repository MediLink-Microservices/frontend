import axios from 'axios'
import { clearAuthSession, getStoredAuthValue } from '../utils/authStorage'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: DEFAULT_HEADERS,
  })

  client.interceptors.request.use(
    (config) => {
      const token = getStoredAuthValue('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthSession()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

const authClient = createClient('/api/auth')
const doctorClient = createClient('/api')
const patientClient = createClient('/api')
const appointmentClient = createClient('/api')
const paymentClient = createClient('/api')
const telemedicineClient = createClient('/api')

export const authAPI = {
  login: (credentials) => authClient.post('/login', credentials),
  register: (userData) => authClient.post('/register', userData),
  adminRegister: (userData) => authClient.post('/admin/register', userData),
  validateToken: (token) => authClient.get('/validate', { headers: { Authorization: `Bearer ${token}` } }),
  refreshToken: (refreshToken) => authClient.post('/refresh', null, { params: { refreshToken } }),
  logout: () => authClient.post('/logout'),
  adminStats: () => authClient.get('/admin/stats'),
  adminUsers: (role = 'ALL') => authClient.get('/admin/users', { params: { role } }),
  approveUser: (userId, approved) => authClient.put(`/admin/users/${userId}/approve`, null, { params: { approved } }),
  updateUserDetails: (userId, updates) => authClient.put(`/admin/users/${userId}`, updates),
}

export const doctorAPI = {
  getAllDoctors: () => doctorClient.get('/doctors'),
  getDoctorById: (id) => doctorClient.get(`/doctors/${id}`),
  getDoctorsBySpecialty: (specialty) => doctorClient.get('/doctors/search', { params: { specialty } }),
  createDoctor: (data) => doctorClient.post('/doctors', data),
  getHospitals: () => doctorClient.get('/hospitals'),
  updateDoctorProfile: (id, data) => doctorClient.put(`/doctors/${id}`, data),
  getDoctorAppointments: (doctorId) => appointmentClient.get(`/appointments/doctor/${doctorId}`),
}

export const patientAPI = {
  getPatientProfile: (id) => patientClient.get(`/patient/${id}`),
  getPatientProfileByAuthUserId: (authUserId) => patientClient.get(`/patient/by-auth-user/${authUserId}`),
  getAllPatients: () => patientClient.get('/patient'),
  createOrUpdatePatientProfile: (data) => patientClient.post('/patient/profile', data),
  uploadMedicalReport: (patientId, formData) => patientClient.post(`/patient/${patientId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteMedicalReport: (patientId, recordId) => patientClient.delete(`/patient/${patientId}/report/${recordId}`),
  getPatientAppointments: (id) => appointmentClient.get(`/appointments/patient/${id}`),
}

export const appointmentAPI = {
  createAppointment: (data) => appointmentClient.post('/appointments/book', data),
  getAllAppointments: () => appointmentClient.get('/appointments'),
  getAppointmentById: (id) => appointmentClient.get(`/appointments/${id}`),
  getPatientAppointments: (id) => appointmentClient.get(`/appointments/patient/${id}`),
  updateAppointmentStatus: (id, status) => appointmentClient.put(`/appointments/${id}/status`, null, { params: { status } }),
  updateAppointmentTime: (id, newDateTime) => appointmentClient.put(`/appointments/${id}/modify`, null, { params: { newDateTime } }),
  cancelAppointment: (id, reason) => appointmentClient.delete(`/appointments/${id}/cancel`, { params: { reason } }),
}

export const paymentAPI = {
  processPayment: (data) => paymentClient.post('/payments/process', data),
  getPaymentByAppointmentId: (appointmentId) => paymentClient.get(`/payments/appointment/${appointmentId}`),
}

export const telemedicineAPI = {
  createConsultation: (data) => telemedicineClient.post('/telemedicine/create', data),
}

export default doctorClient
