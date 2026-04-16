import axios from 'axios'

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
      const token = localStorage.getItem('token')
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
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

const authClient = createClient('http://localhost:8081')
const doctorClient = createClient('http://localhost:8083/api')
const patientClient = createClient('http://localhost:8086/api')
const appointmentClient = createClient('http://localhost:8084/api')
const paymentClient = createClient('http://localhost:8085/api')
const telemedicineClient = createClient('http://localhost:8088/api')

export const authAPI = {
  login: (credentials) => authClient.post('/auth/login', credentials),
  register: (userData) => authClient.post('/auth/register', userData),
  adminRegister: (userData) => authClient.post('/auth/admin/register', userData),
  validateToken: (token) => authClient.get('/auth/validate', { headers: { Authorization: `Bearer ${token}` } }),
  refreshToken: (refreshToken) => authClient.post('/auth/refresh', null, { params: { refreshToken } }),
  logout: () => authClient.post('/auth/logout'),
  adminStats: () => authClient.get('/auth/admin/stats'),
  adminUsers: (role = 'ALL') => authClient.get('/auth/admin/users', { params: { role } }),
  approveUser: (userId, approved) => authClient.put(`/auth/admin/users/${userId}/approve`, null, { params: { approved } }),
  updateUserDetails: (userId, updates) => authClient.put(`/auth/admin/users/${userId}`, updates),
}

export const doctorAPI = {
  getAllDoctors: () => doctorClient.get('/doctors'),
  getDoctorById: (id) => doctorClient.get(`/doctors/${id}`),
  getDoctorsBySpecialty: (specialty) => doctorClient.get('/doctors/search', { params: { specialty } }),
  updateDoctorProfile: (id, data) => doctorClient.put(`/doctors/${id}`, data),
  getDoctorAppointments: (doctorId) => appointmentClient.get(`/appointments/doctor/${doctorId}`),
}

export const patientAPI = {
  getPatientProfile: (id) => patientClient.get(`/patient/${id}`),
  getPatientAppointments: (id) => appointmentClient.get(`/appointments/patient/${id}`),
}

export const appointmentAPI = {
  createAppointment: (data) => appointmentClient.post('/appointments/book', data),
  getAllAppointments: () => appointmentClient.get('/appointments'),
  getAppointmentById: (id) => appointmentClient.get(`/appointments/${id}`),
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
