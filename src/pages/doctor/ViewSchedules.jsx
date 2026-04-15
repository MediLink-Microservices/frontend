import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ViewSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchHospitals();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        setError('Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleUpdate = async () => {
    if (!editingSchedule) return;

    try {
      const response = await fetch(`http://localhost:8083/api/schedules/${editingSchedule.scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSchedule)
      });

      if (response.ok) {
        setSchedules(schedules.map(s => 
          s.scheduleId === editingSchedule.scheduleId ? editingSchedule : s
        ));
        setEditingSchedule(null);
        alert('Schedule updated successfully!');
      } else {
        alert('Failed to update schedule');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await fetch(`http://localhost:8083/api/schedules/${scheduleId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setSchedules(schedules.filter(s => s.scheduleId !== scheduleId));
          alert('Schedule deleted successfully!');
        } else {
          alert('Failed to delete schedule');
        }
      } catch (err) {
        alert('Network error. Please try again.');
      }
    }
  };

  const getConsultationTypeLabel = (type) => {
    const typeMap = {
      'IN_PERSON': 'In Person',
      'ONLINE': 'Online',
      'BOTH': 'Both',
      'TELEMEDICINE': 'Telemedicine'
    };
    return typeMap[type] || type;
  };

  const getConsultationTypeColor = (type) => {
    const colorMap = {
      'IN_PERSON': 'bg-blue-100 text-blue-800',
      'ONLINE': 'bg-green-100 text-green-800',
      'BOTH': 'bg-purple-100 text-purple-800',
      'TELEMEDICINE': 'bg-orange-100 text-orange-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
            <p className="text-gray-600 mt-2">View and manage all doctor schedules in the system</p>
          </div>
          <Link
            to="/doctor/add-schedule"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Schedule
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first schedule</p>
            <Link
              to="/doctor/add-schedule"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Schedule
            </Link>
          </div>
        ) : (
          <div>
            {editingSchedule && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select
                      value={editingSchedule.day}
                      onChange={(e) => setEditingSchedule({...editingSchedule, day: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={editingSchedule.startTime}
                      onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={editingSchedule.endTime}
                      onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                    <select
                      value={editingSchedule.consultationType}
                      onChange={(e) => setEditingSchedule({...editingSchedule, consultationType: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="IN_PERSON">In Person</option>
                      <option value="ONLINE">Online</option>
                      <option value="BOTH">Both</option>
                      <option value="TELEMEDICINE">Telemedicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Limit</label>
                    <input
                      type="number"
                      value={editingSchedule.patientLimit}
                      onChange={(e) => setEditingSchedule({...editingSchedule, patientLimit: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                    <select
                      value={editingSchedule.isAvailable.toString()}
                      onChange={(e) => setEditingSchedule({...editingSchedule, isAvailable: e.target.value === 'true'})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Schedule
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {schedules.length} Schedule{schedules.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor & Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultation Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.scheduleId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Doctor ID: {schedule.doctorId}</div>
                          <div className="text-sm text-gray-500">Hospital ID: {schedule.hospitalId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDayColor(schedule.day)}`}>
                          {schedule.day}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.startTime} - {schedule.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConsultationTypeColor(schedule.consultationType)}`}>
                          {getConsultationTypeLabel(schedule.consultationType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.patientLimit} patients</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          schedule.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.scheduleId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          )}
        </div>
      </div>
  );
};

export default ViewSchedules;
