import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import AddMedicalLocation from './pages/doctor/AddMedicalLocation'
import AddDoctor from './pages/doctor/AddDoctor'
import AllRegisteredDoctors from './components/AllRegisteredDoctors'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="doctor/medical-location" element={<AddMedicalLocation />} />
          <Route path="doctor/add-doctor" element={<AddDoctor />} />
          <Route path="doctor/view-doctors" element={<AllRegisteredDoctors />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
