import React from 'react'
import { useParams } from 'react-router-dom'

const PrescriptionWritingPage = () => {
  const { appointmentId } = useParams()

  return (
    <div>
      <h1>Prescription Writing Page</h1>
      <p>Prescription writing page content goes here</p>
      <p>Appointment ID: {appointmentId}</p>
    </div>
  )
}

export default PrescriptionWritingPage
