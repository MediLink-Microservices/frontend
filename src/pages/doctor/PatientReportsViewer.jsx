import React from 'react'
import { useParams } from 'react-router-dom'

const PatientReportsViewer = () => {
  const { patientId } = useParams()

  return (
    <div>
      <h1>Patient Reports Viewer Page</h1>
      <p>Patient reports viewer page content goes here</p>
      <p>Patient ID: {patientId}</p>
    </div>
  )
}

export default PatientReportsViewer
