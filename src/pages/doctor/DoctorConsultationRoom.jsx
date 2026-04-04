import React from 'react'
import { useParams } from 'react-router-dom'

const DoctorConsultationRoom = () => {
  const { appointmentId } = useParams()

  return (
    <div>
      <h1>Doctor Consultation Room</h1>
      <p>Doctor consultation room content goes here</p>
      <p>Appointment ID: {appointmentId}</p>
    </div>
  )
}

export default DoctorConsultationRoom
