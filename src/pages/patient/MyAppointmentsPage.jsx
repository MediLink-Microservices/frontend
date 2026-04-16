import React, { useState } from 'react';

const MyAppointmentsPage = () => {
  const [patientId, setPatientId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadAppointments = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8084/api/appointments/patient/${patientId}`);
      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load appointments.');
      }

      setAppointments(Array.isArray(payload) ? payload : []);
    } catch (requestError) {
      setAppointments([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-2 text-gray-600">
            Load the patient appointments list using the patient ID from your system.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleLoadAppointments}>
            <input
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
              onChange={(event) => setPatientId(event.target.value)}
              placeholder="Enter patient ID"
              required
              value={patientId}
            />
            <button
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Loading...' : 'Load Appointments'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {appointments.length === 0 && !error && !loading && (
              <p className="text-sm text-gray-500">No appointments loaded yet.</p>
            )}

            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Dr. {appointment.doctorName}
                    </h2>
                    <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
                    <p className="text-sm text-gray-600">{appointment.doctorHospital}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-3">
                  <p>Date & Time: {appointment.appointmentDateTime}</p>
                  <p>Appointment No: {appointment.appointmentNumber ?? 'Not assigned'}</p>
                  <p>Fee: Rs. {appointment.consultationFee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
