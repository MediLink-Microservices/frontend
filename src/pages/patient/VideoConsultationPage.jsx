import React from 'react'
import { useParams } from 'react-router-dom'

const VideoConsultationPage = () => {
  const { appointmentId } = useParams()

  return (
    <div>
      <h1>Video Consultation Page</h1>
      <p>Video consultation page content goes here</p>
      <p>Appointment ID: {appointmentId}</p>
    </div>
  )
}

export default VideoConsultationPage
