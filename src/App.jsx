import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminRegisterPage from './pages/auth/AdminRegisterPage'
import DoctorRegisterPage from './pages/auth/DoctorRegisterPage'

// Dashboard pages
import AdminDashboard from './pages/admin/AdminDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientDashboard from './pages/patient/PatientDashboard'

// Doctor common pages
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
// import AllRegisteredDoctors from './components/AllRegisteredDoctors'

// Patient pages
import BookAppointmentPage from './pages/patient/BookAppointmentPage'

// Protected route
import ProtectedRoute from "./components/Admin/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/admin" element={<AdminRegisterPage />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />

        {/* Layout routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          
          {/* Dashboard routes (unprotected - for legacy support if needed, or redirecting) */}
          <Route path="patient/dashboard" element={<PatientDashboard />} />
          <Route path="doctor/dashboard" element={<DoctorDashboard />} />
          
          {/* Sub-pages */}
          <Route path="doctor/appointments" element={<AppointmentsPage />} />
          <Route path="doctor/patients" element={<PatientsPage />} />
          <Route path="doctor/telemedicine" element={<TelemedicinePage />} />
          <Route path="doctor/prescriptions" element={<PrescriptionsPage />} />
          <Route path="doctor/schedule" element={<SchedulePage />} />
          <Route path="doctor/view-doctors" element={<FindDoctorsPage />} />
          <Route path="doctor/medical-location" element={<AddMedicalLocation />} />
          <Route path="doctor/add-doctor" element={<AddDoctor />} />
          <Route path="doctor/add-hospital" element={<AddHospital />} />
          <Route path="doctor/view-hospitals" element={<ViewHospitals />} />
          <Route path="doctor/add-prescription" element={<AddPrescription />} />
          <Route path="doctor/add-schedule" element={<AddSchedule />} />
          <Route path="doctor/view-schedules" element={<ViewSchedules />} />
          <Route path="doctor/view-doctors-list" element={<ViewDoctors />} />
          {/* <Route path="doctor/view-all-doctors" element={<AllRegisteredDoctors />} /> */}
          <Route path="doctor/prescription-writing" element={<PrescriptionWriting />} />
          <Route path="doctor/availability-schedule" element={<AvailabilitySchedulePage />} />
          <Route path="patient/book-appointment" element={<BookAppointmentPage />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient"
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
