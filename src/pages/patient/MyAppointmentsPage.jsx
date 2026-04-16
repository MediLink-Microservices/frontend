import React, { useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Hospital,
  LoaderCircle,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-medical-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4" />
                Patient Appointment Center
              </div>
              <h1 className="mt-4 text-4xl font-bold font-display">View your appointments in one place</h1>
              <p className="mt-3 max-w-2xl text-white/85">
                Load a patient profile, review appointment status, and quickly see doctor, hospital, and payment-related details.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Loaded</p>
                <p className="mt-2 text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Patient ID</p>
                <p className="mt-2 truncate text-lg font-semibold">{patientId || 'Waiting'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Lookup</p>
              <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Find patient appointment records</h2>
            </div>
            <form className="flex w-full flex-col gap-4 md:flex-row lg:max-w-3xl" onSubmit={handleLoadAppointments}>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="block w-full rounded-2xl border border-gray-200 px-11 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                  onChange={(event) => setPatientId(event.target.value)}
                  placeholder="Enter patient ID"
                  required
                  value={patientId}
                />
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-3 text-sm font-semibold text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Load Appointments
                  </>
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 space-y-5">
            {appointments.length === 0 && !error && !loading && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-6 py-10 text-center text-sm text-gray-500">
                No appointments loaded yet. Enter a patient ID to view booking and payment progress.
              </div>
            )}

            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-medical"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-sky-50 p-3">
                        <Stethoscope className="h-5 w-5 text-medilink-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-medilink-dark">
                          Dr. {appointment.doctorName}
                        </h2>
                        <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                      <p className="flex items-start gap-3">
                        <Hospital className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>{appointment.doctorHospital}</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>{new Date(appointment.appointmentDateTime).toLocaleString('en-LK')}</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>Appointment No: {appointment.appointmentNumber ?? 'Not assigned'}</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>Fee: Rs. {appointment.consultationFee}</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>Patient ID: {appointment.patientId}</span>
                      </p>
                      <p className="flex items-start gap-3">
                        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                        <span>Consultation: {appointment.consultationType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:max-w-xs xl:flex-col xl:items-end">
                    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                      appointment.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : appointment.status === 'PENDING_PAYMENT'
                          ? 'bg-amber-50 text-amber-700'
                          : appointment.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-sky-50 text-sky-700'
                    }`}>
                      {appointment.status}
                    </span>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-gray-500">
                      Created {new Date(appointment.createdAt).toLocaleString('en-LK')}
                    </div>
                  </div>
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
