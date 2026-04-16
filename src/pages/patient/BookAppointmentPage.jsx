import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  HeartPulse,
  Hospital,
  IdCard,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wallet,
  XCircle
} from 'lucide-react';
import { patientAPI } from '../../services/api';

const resolveStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const buildPatientName = (patient, fallbackName = '') => {
  if (!patient) {
    return fallbackName;
  }

  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  return fullName || patient.name || fallbackName;
};

const getPatientInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'PT';

const BookAppointmentPage = () => {
  const storedUser = resolveStoredUser();
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [step, setStep] = useState(1); // 1: select specialty, 2: select doctor, 3: select schedule, 4: confirm
  const [patientDetails, setPatientDetails] = useState({
    patientId: '',
    patientName: storedUser?.name || '',
  });
  const [patientProfile, setPatientProfile] = useState(null);
  const [patientLoading, setPatientLoading] = useState(Boolean(storedUser?.userId || storedUser?.id));
  const [patientLookupError, setPatientLookupError] = useState('');
  const [formError, setFormError] = useState('');

  // Step 1: Specialty selection
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Step 2: Doctor selection
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Step 3: Schedule selection
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // Step 4: Appointment details
  const [appointmentData, setAppointmentData] = useState({
    consultationType: 'IN_PERSON',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    appointmentId: '',
    patientId: '',
    amount: '',
    paymentMethod: 'CREDIT_CARD',
    recipientEmail: '',
    recipientPhone: '',
    simulateSuccess: true,
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  // Common specialties
  const commonSpecialties = [
    'CARDIOLOGY', 'DERMATOLOGY', 'ENDOCRINOLOGY', 'GASTROENTEROLOGY',
    'GENERAL PRACTICE', 'NEUROLOGY', 'ONCOLOGY', 'PEDIATRICS',
    'PSYCHIATRY', 'RADIOLOGY', 'SURGERY', 'ORTHOPEDICS'
  ];

  const formatAppointmentDateTime = (dateTime) => {
    if (!dateTime) {
      return 'Not available';
    }

    const parsedDate = new Date(dateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateTime;
    }

    return parsedDate.toLocaleString('en-LK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    setSpecialties(commonSpecialties);
    fetchHospitals();
  }, []);

  useEffect(() => {
    const authUserId = storedUser?.userId || storedUser?.id;

    if (!authUserId) {
      setPatientLoading(false);
      return;
    }

    const fetchPatientProfile = async () => {
      setPatientLoading(true);
      setPatientLookupError('');

      try {
        const response = await patientAPI.getPatientProfileByAuthUserId(authUserId);
        const profile = response.data;
        setPatientProfile(profile);
        setPatientDetails((prev) => ({
          ...prev,
          patientId: profile.id,
          patientName: buildPatientName(profile, storedUser?.name || prev.patientName),
        }));
      } catch (error) {
        setPatientLookupError('No patient profile is linked to this login yet. Please complete patient registration/profile linking first.');
        setPatientDetails((prev) => ({
          ...prev,
          patientId: '',
          patientName: storedUser?.name || prev.patientName,
        }));
      } finally {
        setPatientLoading(false);
      }
    };

    fetchPatientProfile();
  }, [storedUser?.id, storedUser?.name, storedUser?.userId]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/hospitals');
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleSpecialtySelect = (specialty) => {
    if (!patientDetails.patientId.trim()) {
      setFormError('Enter the patient ID before starting the booking.');
      return;
    }

    setFormError('');
    setSelectedSpecialty(specialty);
    fetchDoctorsBySpecialty(specialty);
  };

  const fetchDoctorsBySpecialty = async (specialty) => {
    setLoadingDoctors(true);
    try {
      const response = await fetch(`http://localhost:8083/api/doctors/search?specialty=${specialty}`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
        setStep(2);
      } else {
        console.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorSchedules(doctor.doctorId);
  };

  const fetchDoctorSchedules = async (doctorId) => {
    setLoadingSchedules(true);
    try {
      const response = await fetch(`http://localhost:8083/api/schedules/doctor/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.filter(schedule => schedule.isAvailable));
        
        // Fetch doctor appointments for appointment number calculation
        await fetchDoctorAppointments(doctorId);
        setStep(3);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchDoctorAppointments = async (doctorId) => {
    try {
      const response = await fetch(`http://localhost:8084/api/appointments/doctor/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setDoctorAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    }
  };

  const getNextAppointmentNumber = (scheduleDate) => {
    // Count appointments for this doctor on the same date
    const appointmentsForDate = doctorAppointments.filter(appointment => {
      const appointmentDate = appointment.appointmentDateTime ? 
        appointment.appointmentDateTime.split('T')[0] : '';
      return appointmentDate === scheduleDate && 
             appointment.appointmentNumber !== null &&
             appointment.status !== 'CANCELLED';
    });

    console.log('Appointments for date', scheduleDate, ':', appointmentsForDate);
    console.log('Doctor appointments total:', doctorAppointments);

    // If no appointments for this date, start with 1
    if (appointmentsForDate.length === 0) {
      console.log('No appointments found, returning 1');
      return 1;
    }

    // Get the highest appointment number and add 1
    const maxNumber = Math.max(...appointmentsForDate.map(a => a.appointmentNumber || 0));
    console.log('Max appointment number found:', maxNumber);
    return maxNumber + 1;
  };

  // const fetchAppointments = async () => {
  //   try {
  //     const response = await fetch('http://localhost:8084/appointments');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setAppointments(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching appointments:', error);
  //   }
  // };

  const getAvailableSeats = (schedule) => {
    // Get the date for this specific schedule day
    const today = new Date();
    const scheduleDate = getScheduleDate(today, schedule.day);
    
    const appointmentsForDate = doctorAppointments.filter(appointment => {
      const appointmentDate = appointment.appointmentDateTime ? 
        appointment.appointmentDateTime.split('T')[0] : '';
      return appointmentDate === scheduleDate && 
             appointment.status !== 'CANCELLED';
    });

    const availableSeats = schedule.patientLimit - appointmentsForDate.length;
    return Math.max(0, availableSeats);
  };

  const getScheduleDate = (currentDate, scheduleDay) => {
    // Find the next occurrence of the schedule day
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDayIndex = currentDate.getDay();
    const scheduleDayIndex = daysOfWeek.indexOf(scheduleDay.toUpperCase());
    
    let daysUntilSchedule = scheduleDayIndex - currentDayIndex;
    if (daysUntilSchedule <= 0) {
      daysUntilSchedule += 7; // If the day has passed this week, go to next week
    }
    
    const scheduleDate = new Date(currentDate);
    scheduleDate.setDate(currentDate.getDate() + daysUntilSchedule);
    return scheduleDate.toISOString().split('T')[0];
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  const selectedScheduleDate = useMemo(() => {
    if (!selectedSchedule) {
      return '';
    }

    return getScheduleDate(new Date(), selectedSchedule.day);
  }, [selectedSchedule]);

  const projectedAppointmentNumber = useMemo(() => {
    if (!selectedScheduleDate) {
      return null;
    }

    return getNextAppointmentNumber(selectedScheduleDate);
  }, [doctorAppointments, selectedScheduleDate]);

  const patientDisplayName = patientDetails.patientName || storedUser?.name || 'Patient';
  const patientInitials = useMemo(() => getPatientInitials(patientDisplayName), [patientDisplayName]);
  const hasLinkedPatient = Boolean(patientDetails.patientId);

  const handlePatientLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('latestAppointment');
    window.location.href = '/login';
  };

  const handlePaymentChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRestartFlow = () => {
    setStep(1);
    setSelectedSpecialty('');
    setSelectedDoctor(null);
    setSelectedSchedule(null);
    setDoctors([]);
    setSchedules([]);
    setDoctorAppointments([]);
    setAppointmentData({
      consultationType: 'IN_PERSON',
      notes: ''
    });
    setBookingSuccess(null);
    setBookingError('');
    setPaymentResult(null);
    setPaymentError('');
  };

  const handleProcessPayment = async (event) => {
    event.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');
    setPaymentResult(null);

    try {
      const response = await fetch('http://localhost:8085/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentForm,
          amount: Number(paymentForm.amount),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Payment processing failed.');
      }

      setPaymentResult(payload);
      setBookingSuccess(prev => prev ? { ...prev, status: 'CONFIRMED' } : prev);
    } catch (error) {
      setPaymentError(error.message || 'Payment processing failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const createTelemedicineSession = async (appointmentDate) => {
    try {
      const telemedicineRequest = {
        doctorId: selectedDoctor.doctorId,
        patientId: patientDetails.patientId.trim(),
        patientName: patientDetails.patientName.trim() || 'Patient',
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        consultationType: 'TELEMEDICINE',
        appointmentDateTime: `${appointmentDate}T${selectedSchedule.startTime}:00`,
        notes: appointmentData.notes
      };

      const response = await fetch('http://localhost:8088/api/telemedicine/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemedicineRequest),
      });

      if (response.ok) {
        const telemedicineSession = await response.json();
        console.log('Telemedicine session created:', telemedicineSession);
      }
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
    }
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    // Reset consultation type to match schedule capabilities
    if (schedule.consultationType === 'IN_PERSON') {
      setAppointmentData(prev => ({ ...prev, consultationType: 'IN_PERSON' }));
    } else if (schedule.consultationType === 'TELEMEDICINE') {
      setAppointmentData(prev => ({ ...prev, consultationType: 'TELEMEDICINE' }));
    } else {
      setAppointmentData(prev => ({ ...prev, consultationType: 'IN_PERSON' })); // Default to IN_PERSON for BOTH
    }
    setStep(4);
  };

  const handleBookAppointment = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      // Create appointment date time properly (must be in the future)
      const today = new Date();
      const appointmentDate = getScheduleDate(today, selectedSchedule.day); // Get correct schedule date
      const appointmentDateTime = `${appointmentDate}T${selectedSchedule.startTime}:00`;

      // Calculate next appointment number
      const nextAppointmentNumber = getNextAppointmentNumber(appointmentDate);
      const doctorHospital = getHospitalName(selectedSchedule.hospitalId);

      const appointmentRequest = {
        patientId: patientDetails.patientId.trim(),
        doctorId: selectedDoctor.doctorId,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorHospital: doctorHospital,
        consultationFee: selectedDoctor.fee || 50.0,
        consultationType: appointmentData.consultationType, // Add consultation type
        appointmentDateTime: appointmentDateTime,
        notes: appointmentData.notes,
        appointmentNumber: nextAppointmentNumber // Send calculated appointment number
      };

      const response = await fetch('http://localhost:8084/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentRequest),
      });

      if (response.ok) {
        const createdAppointment = await response.json();
        sessionStorage.setItem('latestAppointment', JSON.stringify(createdAppointment));
        
        // If consultation type is telemedicine, create telemedicine session
        if (appointmentData.consultationType === 'TELEMEDICINE') {
          await createTelemedicineSession(appointmentDate);
        }

        const successAppointment = {
          ...createdAppointment,
          appointmentNumber: createdAppointment.appointmentNumber ?? nextAppointmentNumber,
          doctorName: createdAppointment.doctorName || selectedDoctor.name,
          doctorSpecialty: createdAppointment.doctorSpecialty || selectedDoctor.specialty,
          doctorHospital: createdAppointment.doctorHospital || doctorHospital,
          consultationFee: createdAppointment.consultationFee || selectedDoctor.fee || 50,
          appointmentDateTime: createdAppointment.appointmentDateTime || appointmentDateTime,
        };

        setBookingSuccess(successAppointment);
        setPaymentForm({
          appointmentId: successAppointment.id || '',
          patientId: successAppointment.patientId || patientDetails.patientId.trim(),
          amount: successAppointment.consultationFee || '',
          paymentMethod: 'CREDIT_CARD',
          recipientEmail: '',
          recipientPhone: '',
          simulateSuccess: true,
        });
        setPaymentResult(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setBookingError(errorData.message || 'Failed to book appointment. Please try again.');
      }
    } catch (error) {
      setBookingError('Error booking appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePatientDetailChange = (event) => {
    const { name, value } = event.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getConsultationTypeLabel = (type) => {
    const typeMap = {
      'IN_PERSON': 'In Person',
      'TELEMEDICINE': 'Telemedicine'
    };
    return typeMap[type] || type;
  };

  const shouldShowConsultationType = (scheduleConsultationType, selectedConsultationType) => {
    // If schedule supports BOTH, show both options
    if (scheduleConsultationType === 'BOTH') {
      return true;
    }
    // If schedule is IN_PERSON, only show IN_PERSON option
    if (scheduleConsultationType === 'IN_PERSON') {
      return selectedConsultationType === 'IN_PERSON';
    }
    // If schedule is TELEMEDICINE, only show TELEMEDICINE option
    if (scheduleConsultationType === 'TELEMEDICINE') {
      return selectedConsultationType === 'TELEMEDICINE';
    }
    return false;
  };

  const getAvailableConsultationTypes = (scheduleConsultationType) => {
    if (scheduleConsultationType === 'BOTH') {
      return [
        { value: 'IN_PERSON', label: 'In Person' },
        { value: 'TELEMEDICINE', label: 'Telemedicine' }
      ];
    }
    if (scheduleConsultationType === 'IN_PERSON') {
      return [{ value: 'IN_PERSON', label: 'In Person' }];
    }
    if (scheduleConsultationType === 'TELEMEDICINE') {
      return [{ value: 'TELEMEDICINE', label: 'Telemedicine' }];
    }
    return [];
  };

  const getDayColor = (day) => {
    const dayColors = {
      'Monday': 'bg-red-100 text-red-800',
      'Tuesday': 'bg-yellow-100 text-yellow-800',
      'Wednesday': 'bg-green-100 text-green-800',
      'Thursday': 'bg-blue-100 text-blue-800',
      'Friday': 'bg-indigo-100 text-indigo-800',
      'Saturday': 'bg-purple-100 text-purple-800',
      'Sunday': 'bg-pink-100 text-pink-800'
    };
    return dayColors[day] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPatientProfile((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-left shadow-medical backdrop-blur-sm transition hover:shadow-medical-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-bold text-white shadow-medical">
                {patientInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-medilink-dark">{patientDisplayName}</p>
                <p className="truncate text-xs text-gray-500">
                  {patientProfile?.email || storedUser?.email || 'Patient profile'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showPatientProfile && (
              <>
                <button
                  type="button"
                  aria-label="Close patient profile"
                  className="fixed inset-0 z-10 cursor-default bg-transparent"
                  onClick={() => setShowPatientProfile(false)}
                />
                <div className="absolute right-0 z-20 mt-3 w-[320px] rounded-3xl border border-white/80 bg-white/95 p-5 shadow-medical-lg backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-bold text-white shadow-medical">
                      {patientInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-medilink-primary">Patient Profile</p>
                      <h2 className="mt-2 break-words text-xl font-bold text-medilink-dark">{patientDisplayName}</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {hasLinkedPatient
                          ? 'Your profile is linked to this login session.'
                          : 'No linked patient profile was found yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Patient ID</p>
                        <p className="mt-1 break-all text-sm font-semibold text-medilink-dark">{patientDetails.patientId || 'Not linked'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Email</p>
                        <p className="mt-1 break-all text-sm font-semibold text-medilink-dark">{patientProfile?.email || storedUser?.email || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Phone</p>
                        <p className="mt-1 break-words text-sm font-semibold text-medilink-dark">{patientProfile?.phone || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Address</p>
                        <p className="mt-1 break-words text-sm font-semibold text-medilink-dark">{patientProfile?.address || 'Not available'}</p>
                      </div>
                    </div>
                  </div>

                  {patientLookupError && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{patientLookupError}</span>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handlePatientLogout}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-medical-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <HeartPulse className="h-4 w-4" />
                Medilink Patient Booking
              </div>
              <h1 className="mt-4 text-4xl font-bold font-display">
                {patientLoading ? 'Preparing your healthcare dashboard...' : `Welcome back, ${patientDisplayName}`}
              </h1>
              <p className="mt-3 max-w-2xl text-white/85">
                Browse doctors by specialty, compare approved consultants, choose the best slot, and complete payment in one guided healthcare journey.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Specialties</p>
                <p className="mt-2 text-2xl font-bold">{specialties.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Doctors</p>
                <p className="mt-2 text-2xl font-bold">{doctors.length || '-'}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Queue</p>
                <p className="mt-2 text-2xl font-bold">{projectedAppointmentNumber || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {bookingError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        <div className="mb-8">
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-medical backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">How It Works</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-medilink-dark">Follow the steps to complete your booking</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Open the patient profile button in the top-right corner any time to review your linked details while you continue the booking flow.
                </p>
              </div>
              {patientLoading && (
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading profile
                </div>
              )}
            </div>
            <div className="mt-5 space-y-4">
              {[
                { icon: Search, title: 'Browse by specialty', text: 'Start from the treatment area you need and review only matching approved doctors.' },
                { icon: CalendarDays, title: 'Choose your ideal slot', text: 'Compare hospitals, availability, and queue position before you book.' },
                { icon: Wallet, title: 'Complete secure payment', text: 'Finish checkout here so the appointment moves to a confirmed status automatically.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-medilink-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-medilink-dark">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            {patientLookupError && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{patientLookupError}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-medical backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Patient Journey</p>
              <p className="mt-2 text-lg font-semibold text-medilink-dark">Follow the steps to complete your booking</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                    step >= stepNumber || bookingSuccess
                      ? 'bg-gradient-to-br from-medilink-primary to-medilink-secondary text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && <div className={`h-1 w-12 rounded-full ${step > stepNumber || bookingSuccess ? 'bg-medilink-primary' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Select Specialty */}
        {step === 1 && (
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-medilink-dark">Choose a medical specialty</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Start from the specialty you need. We’ll show you approved doctors and let you continue the appointment flow without re-entering your patient profile.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                <div className="flex items-center gap-2 font-semibold">
                  <UserRound className="h-4 w-4" />
                  {patientDisplayName}
                </div>
                <p className="mt-1 text-xs text-sky-600">Patient ID: {patientDetails.patientId || 'Not linked'}</p>
              </div>
            </div>
            {formError && (
              <div className="mb-4 mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {!hasLinkedPatient && (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={patientDetails.patientId}
                    onChange={handlePatientDetailChange}
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter the patient ID from patient-service"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={patientDetails.patientName}
                    onChange={handlePatientDetailChange}
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="Display name for telemedicine"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtySelect(specialty)}
                  className={`group rounded-2xl border px-5 py-5 text-left transition-all duration-200 ${
                    selectedSpecialty === specialty
                      ? 'border-medilink-primary bg-sky-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-medilink-primary hover:bg-sky-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-medilink-dark">{specialty}</div>
                      <p className="mt-2 text-sm text-gray-500">
                        Browse available doctors and continue to schedule selection.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 transition group-hover:bg-white">
                      <Stethoscope className="h-5 w-5 text-medilink-primary" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Doctor */}
        {step === 2 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Doctor - {selectedSpecialty}
            </h2>
            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No doctors found for this specialty</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                        <p className="text-gray-600">
                          {doctor.hospitalIds?.length ? `${doctor.hospitalIds.length} linked hospital(s)` : 'Hospital not assigned'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">
                          Rs. {doctor.fee || 50}
                        </p>
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Schedule */}
        {step === 3 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Schedule - Dr. {selectedDoctor?.name}
            </h2>
            {loadingSchedules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading schedules...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No available schedules found</p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((schedule) => {
                  const availableSeats = getAvailableSeats(schedule);
                  const isAvailable = availableSeats > 0;
                  
                  return (
                    <div
                      key={schedule.scheduleId}
                      className={`border rounded-lg p-4 ${
                        isAvailable 
                          ? 'border-gray-300 hover:border-blue-500 cursor-pointer' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => isAvailable && handleScheduleSelect(schedule)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDayColor(schedule.day)}`}>
                          {schedule.day}
                        </span>
                        <span className={`text-sm font-semibold ${
                          availableSeats > 5 ? 'text-green-600' : 
                          availableSeats > 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {availableSeats} seats available
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.consultationType === 'IN_PERSON' ? 'bg-blue-100 text-blue-800' :
                          schedule.consultationType === 'TELEMEDICINE' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getConsultationTypeLabel(schedule.consultationType)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Total slots: {schedule.patientLimit}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Hospital: {getHospitalName(schedule.hospitalId)}
                      </div>
                      {!isAvailable && (
                        <div className="mt-2 text-xs text-red-600 font-semibold">
                          No seats available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm Appointment */}
        {step === 4 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Appointment</h2>

            <div className="space-y-4 mb-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Doctor Details</h3>
                <p className="text-gray-600">Dr. {selectedDoctor?.name}</p>
                <p className="text-gray-600">{selectedDoctor?.specialty}</p>
                <p className="text-gray-600">{getHospitalName(selectedSchedule?.hospitalId)}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Schedule Details</h3>
                <p className="text-gray-600">{selectedSchedule?.day}</p>
                <p className="text-gray-600">{selectedSchedule?.startTime} - {selectedSchedule?.endTime}</p>
                <p className="text-gray-600">Consultation Fee: Rs. {selectedDoctor?.fee || 50}</p>
                <div className="mt-2 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Your Appointment Number:</strong> {getNextAppointmentNumber(getScheduleDate(new Date(), selectedSchedule?.day))}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Additional Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Type
                    </label>
                    <select
                      value={appointmentData.consultationType}
                      onChange={(e) => setAppointmentData({ ...appointmentData, consultationType: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {getAvailableConsultationTypes(selectedSchedule?.consultationType).map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {!shouldShowConsultationType(selectedSchedule?.consultationType, appointmentData.consultationType) && (
                      <p className="text-xs text-red-600 mt-1">
                        This schedule only supports {getConsultationTypeLabel(selectedSchedule?.consultationType)} consultations
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={appointmentData.notes}
                      onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Any symptoms or specific concerns..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={bookingLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-medical-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Appointment Booked</p>
                  <h2 className="mt-1 text-2xl font-bold">Queue number #{bookingSuccess.appointmentNumber}</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-white/90">
                <p className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                  {formatAppointmentDateTime(bookingSuccess.appointmentDateTime)}
                </p>
                <p className="flex items-start gap-3">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0" />
                  Dr. {bookingSuccess.doctorName}
                </p>
                <p className="flex items-start gap-3">
                  <Hospital className="mt-0.5 h-4 w-4 shrink-0" />
                  {bookingSuccess.doctorHospital}
                </p>
                <p className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Status: {bookingSuccess.status || 'PENDING_PAYMENT'}
                </p>
              </div>

              <div className="mt-8 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Next Step</p>
                <p className="mt-2 text-sm text-white/90">
                  Complete the payment to confirm the appointment automatically in the appointment service.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Payment</p>
                  <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Finish checkout</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Process the demo payment here and keep the patient flow inside one professional screen.
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <CreditCard className="h-6 w-6 text-medilink-secondary" />
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleProcessPayment}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Appointment ID</label>
                    <input
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      name="appointmentId"
                      onChange={handlePaymentChange}
                      required
                      value={paymentForm.appointmentId}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Patient ID</label>
                    <input
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      name="patientId"
                      onChange={handlePaymentChange}
                      required
                      value={paymentForm.patientId}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Amount</label>
                    <input
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      min="100"
                      name="amount"
                      onChange={handlePaymentChange}
                      required
                      step="0.01"
                      type="number"
                      value={paymentForm.amount}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Method</label>
                    <select
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      name="paymentMethod"
                      onChange={handlePaymentChange}
                      value={paymentForm.paymentMethod}
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="NET_BANKING">Net Banking</option>
                      <option value="WALLET">Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Recipient Email</label>
                    <input
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      name="recipientEmail"
                      onChange={handlePaymentChange}
                      placeholder="jane.smith@example.com"
                      type="email"
                      value={paymentForm.recipientEmail}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Recipient Phone</label>
                    <input
                      className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      name="recipientPhone"
                      onChange={handlePaymentChange}
                      placeholder="+1987654321"
                      value={paymentForm.recipientPhone}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                  <input
                    checked={paymentForm.simulateSuccess}
                    name="simulateSuccess"
                    onChange={handlePaymentChange}
                    type="checkbox"
                    className="mt-1"
                  />
                  <span>Simulate a successful payment and confirm the appointment automatically.</span>
                </label>

                {paymentError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {paymentResult && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Payment status: {paymentResult.status}</p>
                      {paymentResult.transactionReference && (
                        <p className="mt-1">Transaction: {paymentResult.transactionReference}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                  <button
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:border-medilink-primary hover:text-medilink-primary"
                    onClick={handleRestartFlow}
                    type="button"
                  >
                    Book another appointment
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-3 text-sm font-semibold text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-60"
                    disabled={paymentLoading}
                    type="submit"
                  >
                    {paymentLoading ? 'Processing payment...' : 'Confirm payment'}
                    {!paymentLoading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;
