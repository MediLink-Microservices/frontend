import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminRegisterPage from './pages/auth/AdminRegisterPage'
import DoctorRegisterPage from './pages/auth/DoctorRegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage'
import PatientProfilePage from './pages/patient/PatientProfilePage'
import PaymentCheckoutPage from './pages/patient/PaymentCheckoutPage'
import BookAppointmentPage from './pages/patient/BookAppointmentPage'
import AppointmentsPage from './pages/doctor/AppointmentsPage'
import PatientsPage from './pages/doctor/PatientsPage'
import TelemedicinePage from './pages/doctor/TelemedicinePage'
import PrescriptionsPage from './pages/doctor/PrescriptionsPage'
import SchedulePage from './pages/doctor/SchedulePage'
import FindDoctorsPage from './pages/doctor/FindDoctorsPage'
import AddMedicalLocation from './pages/doctor/AddMedicalLocation'
import AddDoctor from './pages/doctor/AddDoctor'
import AddHospital from './pages/doctor/AddHospital'
import AddPrescription from './pages/doctor/AddPrescription'
import AddSchedule from './pages/doctor/AddSchedule'
import ViewHospitals from './pages/doctor/ViewHospitals'
import ViewDoctors from './pages/doctor/ViewDoctors'
import ViewSchedules from './pages/doctor/ViewSchedules'
import PrescriptionWriting from './pages/doctor/PrescriptionWriting'
import AvailabilitySchedulePage from './pages/doctor/AvailabilitySchedulePage'
import ProtectedRoute from './components/Admin/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/admin" element={<AdminRegisterPage />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="patient" element={<Navigate replace to="/patient/dashboard" />} />
          <Route path="patient/dashboard" element={<ProtectedRoute allowedRole="PATIENT"><PatientDashboard /></ProtectedRoute>} />
          <Route path="patient/book-appointment" element={<ProtectedRoute allowedRole="PATIENT"><BookAppointmentPage /></ProtectedRoute>} />
          <Route path="patient/appointments" element={<ProtectedRoute allowedRole="PATIENT"><MyAppointmentsPage /></ProtectedRoute>} />
          <Route path="patient/profile" element={<ProtectedRoute allowedRole="PATIENT"><PatientProfilePage /></ProtectedRoute>} />
          <Route path="patient/payment" element={<ProtectedRoute allowedRole="PATIENT"><PaymentCheckoutPage /></ProtectedRoute>} />

          <Route path="doctor" element={<Navigate replace to="/doctor/dashboard" />} />
          <Route path="doctor/dashboard" element={<ProtectedRoute allowedRole="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="doctor/appointments" element={<ProtectedRoute allowedRole="DOCTOR"><AppointmentsPage /></ProtectedRoute>} />
          <Route path="doctor/patients" element={<ProtectedRoute allowedRole="DOCTOR"><PatientsPage /></ProtectedRoute>} />
          <Route path="doctor/telemedicine" element={<ProtectedRoute allowedRole="DOCTOR"><TelemedicinePage /></ProtectedRoute>} />
          <Route path="doctor/prescriptions" element={<ProtectedRoute allowedRole="DOCTOR"><PrescriptionsPage /></ProtectedRoute>} />
          <Route path="doctor/schedule" element={<ProtectedRoute allowedRole="DOCTOR"><SchedulePage /></ProtectedRoute>} />
          <Route path="doctor/view-doctors" element={<ProtectedRoute allowedRole="DOCTOR"><FindDoctorsPage /></ProtectedRoute>} />
          <Route path="doctor/medical-location" element={<ProtectedRoute allowedRole="DOCTOR"><AddMedicalLocation /></ProtectedRoute>} />
          <Route path="doctor/add-doctor" element={<ProtectedRoute allowedRole="DOCTOR"><AddDoctor /></ProtectedRoute>} />
          <Route path="doctor/add-hospital" element={<ProtectedRoute allowedRole="DOCTOR"><AddHospital /></ProtectedRoute>} />
          <Route path="doctor/view-hospitals" element={<ProtectedRoute allowedRole="DOCTOR"><ViewHospitals /></ProtectedRoute>} />
          <Route path="doctor/add-prescription" element={<ProtectedRoute allowedRole="DOCTOR"><AddPrescription /></ProtectedRoute>} />
          <Route path="doctor/add-schedule" element={<ProtectedRoute allowedRole="DOCTOR"><AddSchedule /></ProtectedRoute>} />
          <Route path="doctor/view-schedules" element={<ProtectedRoute allowedRole="DOCTOR"><ViewSchedules /></ProtectedRoute>} />
          <Route path="doctor/view-doctors-list" element={<ProtectedRoute allowedRole="DOCTOR"><ViewDoctors /></ProtectedRoute>} />
          <Route path="doctor/prescription-writing" element={<ProtectedRoute allowedRole="DOCTOR"><PrescriptionWriting /></ProtectedRoute>} />
          <Route path="doctor/availability-schedule" element={<ProtectedRoute allowedRole="DOCTOR"><AvailabilitySchedulePage /></ProtectedRoute>} />

          <Route path="admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/dashboard" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        </Route>

        <Route
          path="/admin-protected"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-protected"
          element={
            <ProtectedRoute allowedRole="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-protected"
          element={
            <ProtectedRoute allowedRole="PATIENT">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
