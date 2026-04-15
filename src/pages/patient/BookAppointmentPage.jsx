import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: select specialty, 2: select doctor, 3: select schedule, 4: confirm

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

  // Common specialties
  const commonSpecialties = [
    'CARDIOLOGY', 'DERMATOLOGY', 'ENDOCRINOLOGY', 'GASTROENTEROLOGY',
    'GENERAL PRACTICE', 'NEUROLOGY', 'ONCOLOGY', 'PEDIATRICS',
    'PSYCHIATRY', 'RADIOLOGY', 'SURGERY', 'ORTHOPEDICS'
  ];

  useEffect(() => {
    setSpecialties(commonSpecialties);
    fetchHospitals();
  }, []);

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
    fetchDoctorSchedules(doctor.id);
  };

  const fetchDoctorSchedules = async (doctorId) => {
    setLoadingSchedules(true);
    try {
      const response = await fetch(`http://localhost:8083/api/schedules/doctor/69dda11899183b33e3e63c9f`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.filter(schedule => schedule.isAvailable));
        
        // Fetch doctor appointments for appointment number calculation
        await fetchDoctorAppointments();
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

  const fetchDoctorAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/appointments/doctor/69dda11899183b33e3e63c9f');
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

  const createTelemedicineSession = async (appointmentNumber, appointmentDate) => {
    try {
      const telemedicineRequest = {
        doctorId: '69dda11899183b33e3e63c9f',
        patientId: '69d1248a5144a126417bf678',
        patientName: 'Current Patient', // This would come from patient profile
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
    try {
      // Create appointment date time properly (must be in the future)
      const today = new Date();
      const appointmentDate = getScheduleDate(today, selectedSchedule.day); // Get correct schedule date
      const appointmentDateTime = `${appointmentDate}T${selectedSchedule.startTime}:00`;

      // Calculate next appointment number
      const nextAppointmentNumber = getNextAppointmentNumber(appointmentDate);

      const appointmentRequest = {
        patientId: '69d1248a5144a126417bf678', // Using the patient ID you provided
        doctorId: '69dda11899183b33e3e63c9f', // Using the doctor ID you provided
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorHospital: selectedDoctor.hospital || 'Hospital',
        consultationFee: selectedDoctor.consultationFee || 50.0,
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
        
        // If consultation type is telemedicine, create telemedicine session
        if (appointmentData.consultationType === 'TELEMEDICINE') {
          await createTelemedicineSession(nextAppointmentNumber, appointmentDate);
        }
        
        // Show appointment number to user
        alert(`Appointment booked successfully!\n\nAppointment Number: ${nextAppointmentNumber}\nDate: ${appointmentDate}\nTime: ${selectedSchedule.startTime}\nDoctor: Dr. ${selectedDoctor.name}\nConsultation: ${getConsultationTypeLabel(appointmentData.consultationType)}\n\nYour appointment number: ${nextAppointmentNumber} of ${selectedSchedule.patientLimit}`);
        
        navigate('/patient/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to book appointment: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      alert('Error booking appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Follow the steps to book your appointment</p>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Specialty */}
        {step === 1 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Medical Specialty</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtySelect(specialty)}
                  className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg font-medium text-gray-900">{specialty}</div>
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
                    key={doctor.id}
                    className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialty}</p>
                        <p className="text-gray-600">{doctor.hospital}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">
                          ${doctor.consultationFee || 50}
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
                <p className="text-gray-600">{selectedDoctor?.hospital}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Schedule Details</h3>
                <p className="text-gray-600">{selectedSchedule?.day}</p>
                <p className="text-gray-600">{selectedSchedule?.startTime} - {selectedSchedule?.endTime}</p>
                <p className="text-gray-600">Consultation Fee: ${selectedDoctor?.consultationFee || 50}</p>
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
      </div>
    </div>
  );
};

export default BookAppointmentPage;
