import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddSchedule = () => {
  const [formData, setFormData] = useState({
    doctorId: '69dda11899183b33e3e63c9f',
    hospitalId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    consultationType: 'IN_PERSON',
    isAvailable: true,
    patientLimit: 10
  });
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/hospitals');
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8083/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Schedule added successfully!');
        navigate('/doctor/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add schedule');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get available days (excluding past days)
  const getAvailableDays = () => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = today.getHours() * 60 + today.getMinutes();
    
    // Convert to our day format (Monday = 0, Sunday = 6)
    const currentDayFormatted = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    
    return allDays.filter((day, index) => {
      // Allow all future days in the current week
      if (index > currentDayFormatted) {
        return true;
      }
      // Allow current day if it's not too late (before 6 PM as a reasonable cutoff)
      if (index === currentDayFormatted && currentTime < 18 * 60) {
        return true;
      }
      // Allow all days for next week (we'll handle this with a more sophisticated approach if needed)
      return false;
    });
  };

  const days = getAvailableDays();
  const consultationTypes = ['IN_PERSON', 'ONLINE', 'BOTH', 'TELEMEDICINE'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Doctor Schedule</h2>
          
          {days.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm mb-6">
              <strong>Note:</strong> No available days for scheduling this week. You can schedule for next week starting tomorrow, or contact support if you need to make special arrangements.
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Doctor ID *
                </label>
                <input
                  type="text"
                  id="doctorId"
                  name="doctorId"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.doctorId}
                  onChange={handleChange}
                  placeholder="Enter doctor ID"
                />
              </div>

              <div>
                <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">
                  Select Hospital *
                </label>
                <select
                  id="hospitalId"
                  name="hospitalId"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.hospitalId}
                  onChange={handleChange}
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.hospitalId} value={hospital.hospitalId}>
                      {hospital.name} - {hospital.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                Day of Week *
              </label>
              <select
                id="day"
                name="day"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                value={formData.day}
                onChange={handleChange}
                disabled={days.length === 0}
              >
                <option value="">
                  {days.length === 0 ? 'No available days this week' : 'Select a day...'}
                </option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {days.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Scheduling is closed for the remainder of this week. Please check back tomorrow for next week's availability.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700">
                Consultation Type *
              </label>
              <select
                id="consultationType"
                name="consultationType"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.consultationType}
                onChange={handleChange}
              >
                {consultationTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').charAt(0) + type.replace('_', ' ').slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patientLimit" className="block text-sm font-medium text-gray-700">
                  Patient Limit *
                </label>
                <input
                  type="number"
                  id="patientLimit"
                  name="patientLimit"
                  required
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.patientLimit}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                  Available for appointments
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || days.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding Schedule...' : 'Add Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSchedule;
