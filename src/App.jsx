import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
// import PatientRegistration from './pages/patient/PatientRegistration'
// import DoctorRegistration from './pages/doctor/DoctorRegistration'
import PatientDashboard from './pages/patient/PatientDashboard'
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage'
import PaymentCheckoutPage from './pages/patient/PaymentCheckoutPage'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
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
// import AllRegisteredDoctors from './components/AllRegisteredDoctors'
import PrescriptionWriting from './pages/doctor/PrescriptionWriting'
import AvailabilitySchedulePage from './pages/doctor/AvailabilitySchedulePage'
import BookAppointmentPage from './pages/patient/BookAppointmentPage'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          {/* <Route path="register/patient" element={<PatientRegistration />} /> */}
          {/* <Route path="register/doctor" element={<DoctorRegistration />} /> */}
          <Route path="patient" element={<Navigate replace to="/patient/dashboard" />} />
          <Route path="patient/dashboard" element={<PatientDashboard />} />
          <Route path="patient/appointments" element={<MyAppointmentsPage />} />
          <Route path="patient/payment" element={<PaymentCheckoutPage />} />
          <Route path="doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="doctor" element={<Navigate replace to="/doctor/dashboard" />} />
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
          <Route path="doctor/view-doctors" element={<ViewDoctors />} />
          <Route path="doctor/prescription-writing" element={<PrescriptionWriting />} />
          <Route path="doctor/availability-schedule" element={<AvailabilitySchedulePage />} />
          <Route path="patient/book-appointment" element={<BookAppointmentPage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
