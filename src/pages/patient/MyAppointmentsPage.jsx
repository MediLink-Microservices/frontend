import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Hospital,
  LoaderCircle,
  PencilLine,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  XCircle,
  Video,
  ExternalLink,
} from 'lucide-react';
import PatientPortalTabs from '../../components/patient/PatientPortalTabs';
import { appointmentAPI, patientAPI } from '../../services/api';
import { getStoredUser } from '../../utils/authStorage';

const POLL_INTERVAL_MS = 15000;

const getStatusClasses = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700';
    case 'PENDING_PAYMENT':
      return 'bg-amber-50 text-amber-700';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700';
    case 'COMPLETED':
      return 'bg-violet-50 text-violet-700';
    default:
      return 'bg-sky-50 text-sky-700';
  }
};

const canManageAppointment = (status) => !['CANCELLED', 'COMPLETED'].includes(status);

const formatDateTimeLocalValue = (dateTime) => {
  if (!dateTime) {
    return '';
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const offsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
};

const MyAppointmentsPage = () => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const [patientProfile, setPatientProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [telemedicineSessions, setTelemedicineSessions] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const patientId = patientProfile?.id || '';

  const fetchTelemedicineSessions = async (patientIdValue) => {
    try {
      const response = await fetch(`http://localhost:8088/api/telemedicine/patient/${patientIdValue}`);
      if (response.ok) {
        const sessions = await response.json();
        // Map sessions by appointmentDateTime for quick lookup
        const sessionMap = {};
        if (Array.isArray(sessions)) {
          sessions.forEach(session => {
            sessionMap[session.appointmentDateTime] = session;
          });
        }
        setTelemedicineSessions(sessionMap);
      }
    } catch (err) {
      console.error('Error fetching telemedicine sessions:', err);
      // Silently fail - this is optional functionality
    }
  };

  const loadAppointments = async ({ silent = false } = {}) => {
    const authUserId = storedUser?.userId || storedUser?.id;

    if (!authUserId) {
      setError('No logged-in patient session was found. Please sign in again.');
      setLoading(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError('');
      const profileResponse = await patientAPI.getPatientProfileByAuthUserId(authUserId);
      const profile = profileResponse.data;
      setPatientProfile(profile);

      const appointmentsResponse = await patientAPI.getPatientAppointments(profile.id);
      const appointmentList = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      appointmentList.sort((first, second) => new Date(second.appointmentDateTime) - new Date(first.appointmentDateTime));
      setAppointments(appointmentList);

      // Fetch telemedicine sessions for this patient
      await fetchTelemedicineSessions(profile.id);
    } catch (requestError) {
      setAppointments([]);
      setPatientProfile(null);
      setError(
        requestError?.response?.data?.message
        || requestError?.message
        || 'Failed to load your appointments.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!patientId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadAppointments({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [patientId]);

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('cancel');
    setCancelReason('');
    setNewDateTime('');
    setActionError('');
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('reschedule');
    setCancelReason('');
    setNewDateTime(formatDateTimeLocalValue(appointment.appointmentDateTime));
    setActionError('');
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setModalMode('');
    setCancelReason('');
    setNewDateTime('');
    setActionError('');
    setActionLoading(false);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment?.id) {
      return;
    }

    if (!cancelReason.trim()) {
      setActionError('Please provide a cancellation reason.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      await appointmentAPI.cancelAppointment(selectedAppointment.id, cancelReason.trim());
      await loadAppointments({ silent: true });
      closeModal();
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message
        || requestError?.message
        || 'Failed to cancel the appointment.'
      );
      setActionLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment?.id) {
      return;
    }

    if (!newDateTime) {
      setActionError('Please choose a new appointment date and time.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      await appointmentAPI.updateAppointmentTime(selectedAppointment.id, newDateTime);
      await loadAppointments({ silent: true });
      closeModal();
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message
        || requestError?.message
        || 'Failed to reschedule the appointment.'
      );
      setActionLoading(false);
    }
  };

  const getTelemedicineLink = (appointment) => {
    if (appointment.consultationType !== 'TELEMEDICINE') {
      return null;
    }
    return telemedicineSessions[appointment.appointmentDateTime] || null;
  };

  const joinMeeting = (meeting) => {
    if (meeting?.jitsiUrl) {
      window.open(meeting.jitsiUrl, '_blank');
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
              <h1 className="mt-4 text-4xl font-bold font-display">Manage your appointments in one place</h1>
              <p className="mt-3 max-w-2xl text-white/85">
                Review real-time appointment status, reschedule upcoming bookings, or cancel visits when plans change.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Loaded</p>
                <p className="mt-2 text-2xl font-bold">{appointments.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Patient ID</p>
                <p className="mt-2 truncate text-lg font-semibold">{patientId || 'Linking...'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PatientPortalTabs />
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Live Tracking</p>
              <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Your linked appointment history</h2>
              <p className="mt-2 text-sm text-gray-500">
                This page refreshes automatically every {POLL_INTERVAL_MS / 1000} seconds while you are signed in.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-600">
                <span className="font-semibold text-medilink-dark">{patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}`.trim() : storedUser?.name || 'Patient'}</span>
                <p className="mt-1 text-xs text-gray-500">{patientProfile?.email || storedUser?.email || 'No email available'}</p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-medilink-primary hover:text-medilink-primary disabled:opacity-50"
                disabled={refreshing || loading}
                onClick={() => loadAppointments({ silent: true })}
                type="button"
              >
                <RefreshCcw className={`h-4 w-4 ${(refreshing || loading) ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-6 py-12 text-sm text-gray-500">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-medilink-primary" />
              Loading your linked appointments...
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {appointments.length === 0 && !error && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-6 py-10 text-center text-sm text-gray-500">
                  No appointments have been booked for this patient yet.
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

                      {appointment.consultationType === 'TELEMEDICINE' && getTelemedicineLink(appointment) && (
                        <button
                          onClick={() => joinMeeting(getTelemedicineLink(appointment))}
                          className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                          type="button"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 xl:max-w-sm xl:flex-col xl:items-end">
                      <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-gray-500">
                        Created {new Date(appointment.createdAt).toLocaleString('en-LK')}
                      </div>

                      {canManageAppointment(appointment.status) && (
                        <div className="flex flex-wrap justify-end gap-3">
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
                            onClick={() => openRescheduleModal(appointment)}
                            type="button"
                          >
                            <PencilLine className="h-4 w-4" />
                            Reschedule
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50"
                            onClick={() => openCancelModal(appointment)}
                            type="button"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-medical-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">
                  {modalMode === 'reschedule' ? 'Modify Booking' : 'Cancel Booking'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-medilink-dark">
                  Dr. {selectedAppointment.doctorName}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(selectedAppointment.appointmentDateTime).toLocaleString('en-LK')}
                </p>
              </div>
              <button
                className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-medilink-primary hover:text-medilink-primary"
                onClick={closeModal}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                <span>
                  Status changes sync from the appointment service automatically. Any update you make here will appear after refresh and background polling.
                </span>
              </div>
            </div>

            {modalMode === 'reschedule' ? (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="new-date-time">
                  Choose a new appointment date and time
                </label>
                <input
                  className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                  id="new-date-time"
                  min={formatDateTimeLocalValue(new Date().toISOString())}
                  onChange={(event) => setNewDateTime(event.target.value)}
                  type="datetime-local"
                  value={newDateTime}
                />
              </div>
            ) : (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="cancel-reason">
                  Cancellation reason
                </label>
                <textarea
                  className="block min-h-32 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                  id="cancel-reason"
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Tell the clinic why you are cancelling this booking."
                  value={cancelReason}
                />
              </div>
            )}

            {actionError && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:border-medilink-primary hover:text-medilink-primary"
                onClick={closeModal}
                type="button"
              >
                Keep current booking
              </button>
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-60 ${
                  newDateTime
                    ? 'bg-gradient-to-r from-medilink-primary to-medilink-secondary'
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                disabled={actionLoading}
                onClick={modalMode === 'reschedule' ? handleRescheduleAppointment : handleCancelAppointment}
                type="button"
              >
                {actionLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {modalMode === 'reschedule' ? <PencilLine className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {modalMode === 'reschedule' ? 'Confirm reschedule' : 'Confirm cancellation'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
