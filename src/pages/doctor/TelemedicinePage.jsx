import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Filter,
  Search,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  Activity,
  Users,
  Stethoscope,
  Monitor,
  Filter as FilterIcon
} from 'lucide-react';

const TelemedicinePage = () => {
  const [user, setUser] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [telemedicineSessions, setTelemedicineSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [patients, setPatients] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    initializeDoctorSession();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [telemedicineSessions, searchTerm, statusFilter, dateFilter]);

  const initializeDoctorSession = async () => {
    try {
      const parsedUser = getStoredUser();
      setUser(parsedUser);

      const doctorsResponse = await fetch('http://localhost:8083/api/doctors');
      if (!doctorsResponse.ok) {
        throw new Error('Unable to load doctor profiles.');
      }

      const doctors = await doctorsResponse.json();
      const matchedDoctor = doctors.find((doctor) => {
        const doctorEmail = doctor.email?.trim().toLowerCase();
        const userEmail = parsedUser?.email?.trim().toLowerCase();
        const doctorName = doctor.name?.trim().toLowerCase();
        const userName = parsedUser?.name?.trim().toLowerCase();

        return (doctorEmail && userEmail && doctorEmail === userEmail)
          || (doctorName && userName && doctorName === userName);
      });

      if (!matchedDoctor?.doctorId) {
        throw new Error('Could not match the logged-in user to a doctor profile.');
      }

      setDoctorId(matchedDoctor.doctorId);
      setLoadError('');
      await fetchTelemedicineSessions(matchedDoctor.doctorId);
    } catch (error) {
      console.error('Error initializing doctor telemedicine session:', error);
      setLoadError(error.message || 'Unable to load telemedicine sessions right now.');
      setTelemedicineSessions([]);
      setFilteredSessions([]);
      setLoading(false);
    }
  };

  const fetchTelemedicineSessions = async (resolvedDoctorId = doctorId) => {
    if (!resolvedDoctorId) {
      setTelemedicineSessions([]);
      setFilteredSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError('');
      const response = await fetch(`http://localhost:8088/api/telemedicine/doctor/${resolvedDoctorId}`);
      if (response.ok) {
        const data = await response.json();
        setTelemedicineSessions(data);
        
        // Fetch patient details for each session
        const patientPromises = data.map(async (session) => {
          if (session.patientId && !patients[session.patientId]) {
            const patientResponse = await fetch(`http://localhost:8086/api/patient/${session.patientId}`);
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              return { [session.patientId]: patientData };
            }
          }
          return null;
        });

        const patientResults = await Promise.all(patientPromises);
        const patientData = patientResults.reduce((acc, result) => {
          if (result) return { ...acc, ...result };
          return acc;
        }, {});
        
        setPatients(patientData);
      } else {
        setLoadError('Telemedicine service returned an error while loading sessions.');
      }
    } catch (error) {
      console.error('Error fetching telemedicine sessions:', error);
      setLoadError('Telemedicine service is unavailable right now. Please make sure the telemedicine-service is running on port 8088.');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...telemedicineSessions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session => {
        const patient = patients[session.patientId];
        const searchLower = searchTerm.toLowerCase();
        return (
          session.patientName?.toLowerCase().includes(searchLower) ||
          session.doctorSpecialty?.toLowerCase().includes(searchLower) ||
          session.consultationType?.toLowerCase().includes(searchLower) ||
          patient?.firstName?.toLowerCase().includes(searchLower) ||
          patient?.lastName?.toLowerCase().includes(searchLower) ||
          patient?.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.appointmentDateTime);
        sessionDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'TODAY':
            return sessionDate.getTime() === today.getTime();
          case 'UPCOMING':
            return sessionDate >= today;
          case 'PAST':
            return sessionDate < today;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));
    
    setFilteredSessions(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      case 'ACTIVE': return <Activity className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const joinVideoCall = (jitsiUrl) => {
    window.open(jitsiUrl, '_blank');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <DoctorHeader toggleSidebar={toggleSidebar} user={user} />
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">Telemedicine Sessions</h1>
                <p className="text-gray-600 mt-2">Manage your video consultation appointments</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Sessions:</span>
                  <span className="ml-2 font-semibold text-medilink-primary">{filteredSessions.length}</span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient name, specialty, or consultation type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Dates</option>
                      <option value="TODAY">Today</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="PAST">Past</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('ALL');
                        setDateFilter('ALL');
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Telemedicine Sessions List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {loadError ? 'Telemedicine service unavailable' : 'No telemedicine sessions found'}
              </h3>
              <p className="text-gray-600">
                {loadError || 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const patient = patients[session.patientId];
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                            <Video className="w-6 h-6 text-medilink-secondary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.patientName || 'Unknown Patient'}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                {getStatusIcon(session.status)}
                                <span>{session.status}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                Session ID: {session.id.slice(-8)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {session.jitsiUrl && (
                            <button
                              onClick={() => joinVideoCall(session.jitsiUrl)}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Monitor className="w-4 h-4" />
                              <span>Join Call</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${selectedSession?.id === session.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Date</p>
                            <p className="text-sm text-gray-600">{formatDate(session.appointmentDateTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Time</p>
                            <p className="text-sm text-gray-600">{formatTime(session.appointmentDateTime)} ({session.durationMinutes} min)</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Specialty</p>
                            <p className="text-sm text-gray-600">{session.doctorSpecialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Consultation</p>
                            <p className="text-sm text-gray-600">{session.consultationType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Session Details */}
                      {selectedSession?.id === session.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-up">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Patient Information */}
                            {patient && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  Patient Information
                                </h5>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Full Name</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {patient.firstName} {patient.lastName}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Email</span>
                                    <span className="text-sm font-medium text-gray-900">{patient.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Phone</span>
                                    <span className="text-sm font-medium text-gray-900">{patient.phone}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Address</span>
                                    <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                                      {patient.address}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Session Information */}
                            <div>
                              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <Video className="w-4 h-4 mr-2" />
                                Session Information
                              </h5>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Patient ID</span>
                                  <span className="text-sm font-medium text-gray-900">{session.patientId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Doctor ID</span>
                                  <span className="text-sm font-medium text-gray-900">{session.doctorId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Hospital</span>
                                  <span className="text-sm font-medium text-gray-900">{session.doctorHospital}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Appointment Number</span>
                                  <span className="text-sm font-medium text-gray-900">#{session.appointmentNumber}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Video Call Information */}
                          {session.jitsiUrl && (
                            <div className="mt-6">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <Monitor className="w-4 h-4 mr-2" />
                                Video Call Information
                              </h5>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Jitsi Meeting URL</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Click to join the video consultation
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => joinVideoCall(session.jitsiUrl)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Join Video Call</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {session.notes && (
                            <div className="mt-6">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">Session Notes</h5>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700">{session.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Created At</p>
                              <p className="text-sm text-gray-600">
                                {new Date(session.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Updated At</p>
                              <p className="text-sm text-gray-600">
                                {new Date(session.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TelemedicinePage;
