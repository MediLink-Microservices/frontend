import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  Users, 
  Calendar, 
  Video, 
  FileText, 
  Clock, 
  Building, 
  UserPlus, 
  TrendingUp,
  Activity,
  Heart,
  Stethoscope,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [telemedicineSessions, setTelemedicineSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0,
    telemedicineSessions: 0,
    revenue: 0,
    satisfaction: 0
  });

  useEffect(() => {
    setUser(getStoredUser());
    fetchDashboardStats();
    fetchTelemedicineSessions();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const DOCTOR_ID = '69dda11899183b33e3e63c9f'; // Replace with actual doctor ID from user context
      
      // Fetch all statistics in parallel
      const [
        appointmentsResponse,
        prescriptionsResponse,
        telemedicineResponse,
        patientsResponse
      ] = await Promise.all([
        fetch(`http://localhost:8084/api/appointments/doctor/69dda11899183b33e3e63c9f`),
        fetch(`http://localhost:8083/api/prescriptions/doctor/69dda11899183b33e3e63c9f`),
        fetch(`http://localhost:8088/api/telemedicine/doctor/69dda11899183b33e3e63c9f`),
        fetch(`http://localhost:8086/api/patient`) // This might need adjustment for doctor-specific patients
      ]);

      const today = new Date().toISOString().split('T')[0];
      
      let totalPatients = 0;
      let todayAppointments = 0;
      let pendingPrescriptions = 0;
      let telemedicineSessions = 0;
      let revenue = 0;

      // Process appointments
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        todayAppointments = appointments.filter(apt => 
          apt.appointmentDate?.startsWith(today)
        ).length;
      }

      // Process prescriptions
      if (prescriptionsResponse.ok) {
        const prescriptions = await prescriptionsResponse.json();
        pendingPrescriptions = prescriptions.filter(pres => 
          pres.status === 'PENDING'
        ).length;
        // Calculate revenue from completed prescriptions
        revenue = prescriptions
          .filter(pres => pres.status === 'COMPLETED')
          .reduce((total, pres) => total + (pres.fee || 0), 0);
      }

      // Process telemedicine sessions
      if (telemedicineResponse.ok) {
        const sessions = await telemedicineResponse.json();
        telemedicineSessions = sessions.length;
      }

      // Process patients (this might need a different endpoint)
      if (patientsResponse.ok) {
        const patients = await patientsResponse.json();
        totalPatients = patients.length; // This should be doctor-specific patients
      }

      setStats({
        totalPatients,
        todayAppointments,
        pendingPrescriptions,
        telemedicineSessions,
        revenue,
        satisfaction: 4.8 // This might come from a ratings API
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <DoctorHeader toggleSidebar={toggleSidebar} user={user} />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-medilink-primary to-medilink-secondary rounded-2xl p-8 text-white shadow-medical-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold font-display mb-2">
                    Good morning, Dr. {user?.name || 'Doctor'}!
                  </h1>
                  <p className="text-white/90 text-lg">
                    Welcome to your Medilink Doctor Portal. Here's your practice overview for today.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <Activity className="w-12 h-12 text-white animate-pulse-soft" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">

            <div className="bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-medilink-success" />
                </div>
                <span className="flex items-center text-xs text-green-600 font-medium">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  8%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
              <p className="text-sm text-gray-600 mt-1">Today's Appointments</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-medilink-warning" />
                </div>
                <span className="flex items-center text-xs text-red-600 font-medium">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  3%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</h3>
              <p className="text-sm text-gray-600 mt-1">Prescriptions</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-medilink-secondary" />
                </div>
                <span className="flex items-center text-xs text-green-600 font-medium">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  25%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.telemedicineSessions}</h3>
              <p className="text-sm text-gray-600 mt-1">Telemedicine Sessions</p>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <Link to="/doctor/appointments" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medilink-primary">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-medilink-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medilink-primary transition-colors">Appointments</h3>
                  <p className="text-sm text-gray-600">Manage schedule</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/patients" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medilink-success">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-medilink-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medilink-success transition-colors">Patients</h3>
                  <p className="text-sm text-gray-600">View records</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/telemedicine" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medilink-secondary">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-medilink-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medilink-secondary transition-colors">Telemedicine</h3>
                  <p className="text-sm text-gray-600">Video consultations</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medilink-warning">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7 text-medilink-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medilink-warning transition-colors">Prescriptions</h3>
                  <p className="text-sm text-gray-600">Write & manage</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/schedule" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medilink-accent">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-medilink-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medilink-accent transition-colors">Schedule</h3>
                  <p className="text-sm text-gray-600">Set availability</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/hospitals" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medical-blue">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building className="w-7 h-7 text-medical-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medical-blue transition-colors">Hospitals</h3>
                  <p className="text-sm text-gray-600">Manage facilities</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/add-doctor" className="group bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-all duration-300 border border-gray-100 hover:border-medical-purple">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7 text-medical-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-medical-purple transition-colors">Add Doctor</h3>
                  <p className="text-sm text-gray-600">Register new doctor</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Telemedicine Sessions */}
          <div className="bg-white rounded-xl shadow-medical border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Telemedicine Sessions</h2>
                <Link to="/doctor/telemedicine" className="text-sm text-medilink-primary hover:text-medilink-secondary transition-colors">
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {telemedicineSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No telemedicine sessions scheduled</p>
                  <Link to="/doctor/telemedicine" className="mt-4 inline-flex items-center px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors">
                    Schedule Session
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {telemedicineSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-medilink-primary transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center">
                            <Video className="w-5 h-5 text-medilink-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{session.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(session.appointmentDateTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                            session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                          {session.jitsiUrl && (
                            <a
                              href={session.jitsiUrl}
                              target="_blank"
                              className="px-3 py-1 bg-medilink-primary text-white text-sm rounded-lg hover:bg-medilink-secondary transition-colors"
                            >
                              Join Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
