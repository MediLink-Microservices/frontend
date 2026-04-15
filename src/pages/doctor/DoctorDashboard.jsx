import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [telemedicineSessions, setTelemedicineSessions] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTelemedicineSessions();
  }, []);

  const fetchTelemedicineSessions = async () => {
    try {
      const response = await fetch('http://localhost:8088/api/telemedicine/doctor/69dda11899183b33e3e63c9f');
      if (response.ok) {
        const data = await response.json();
        setTelemedicineSessions(data);
      }
    } catch (error) {
      console.error('Error fetching telemedicine sessions:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, Dr. {user?.name || 'Doctor'}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/doctor/add-hospital" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Hospital</h2>
            <p className="text-gray-600">Register a new hospital in the system</p>
          </Link>
          
          <Link to="/doctor/view-hospitals" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">View Hospitals</h2>
            <p className="text-gray-600">See all registered hospitals</p>
          </Link>
          
          <Link to="/doctor/add-doctor" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Doctor</h2>
            <p className="text-gray-600">Register a new doctor in the system</p>
          </Link>
          
          <Link to="/doctor/view-doctors" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">View Doctors</h2>
            <p className="text-gray-600">See all registered doctors</p>
          </Link>
          
          <Link to="/doctor/add-prescription" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Prescription</h2>
            <p className="text-gray-600">Create new prescription for patients</p>
          </Link>
          
          <Link to="/doctor/add-schedule" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Schedule</h2>
            <p className="text-gray-600">Set doctor availability schedule</p>
          </Link>
          
          <Link to="/doctor/view-schedules" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">View Schedules</h2>
            <p className="text-gray-600">See all doctor schedules</p>
          </Link>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Appointments</h2>
            <p className="text-gray-600">View and manage patient appointments</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Telemedicine Sessions</h2>
            <p className="text-gray-600 mb-4">View and manage video consultation appointments</p>
            
            {telemedicineSessions.length === 0 ? (
              <p className="text-gray-500">No telemedicine sessions found</p>
            ) : (
              <div className="space-y-3">
                {telemedicineSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.patientName}</h3>
                        <p className="text-sm text-gray-600">Patient ID: {session.patientId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date & Time:</span>
                        <p className="text-gray-600">
                          {new Date(session.appointmentDateTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <p className="text-gray-600">{session.durationMinutes} minutes</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Specialty:</span>
                        <p className="text-gray-600">{session.doctorSpecialty}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Consultation:</span>
                        <p className="text-gray-600">{session.consultationType}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Jitsi Meeting URL:</span>
                        <a 
                          href={session.jitsiUrl} 
                          target="_blank" 
                          className="text-blue-600 hover:text-blue-800 underline ml-2"
                        >
                          Join Video Call
                        </a>
                      </div>
                      {session.notes && (
                        <div>
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Patients</h2>
            <p className="text-gray-600">Access patient records and history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
