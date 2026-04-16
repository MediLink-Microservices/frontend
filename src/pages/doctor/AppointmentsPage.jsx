import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText, 
  Filter,
  Search,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Video,
  Stethoscope,
  Download
} from 'lucide-react';

const AppointmentsPage = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    initializeDoctorSession();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const initializeDoctorSession = async () => {
    try {
      setLoading(true);
      setError('');
      const parsedUser = getStoredUser();
      setUser(parsedUser);

      const doctorsResponse = await fetch('http://localhost:8083/api/doctors');
      if (!doctorsResponse.ok) {
        throw new Error('Unable to load doctor profiles.');
      }

      const doctors = await doctorsResponse.json();
      const normalizedName = parsedUser?.name?.replace(/^Dr\.?\s*/i, '').trim().toLowerCase();
      const matchedDoctor = doctors.find((doctor) => {
        const doctorEmail = doctor.email?.trim().toLowerCase();
        const userEmail = parsedUser?.email?.trim().toLowerCase();
        const doctorName = doctor.name?.trim().toLowerCase();

        return (
          (userEmail && doctorEmail && doctorEmail === userEmail) ||
          (normalizedName && doctorName === normalizedName)
        );
      });

      if (!matchedDoctor?.doctorId) {
        throw new Error('Could not match the logged-in user to a doctor profile.');
      }

      setDoctorId(matchedDoctor.doctorId);
      await fetchAppointments(matchedDoctor.doctorId);
    } catch (sessionError) {
      console.error('Error initializing doctor session:', sessionError);
      setAppointments([]);
      setFilteredAppointments([]);
      setError(sessionError.message || 'Failed to load doctor appointments.');
      setLoading(false);
    }
  };

  const fetchAppointments = async (resolvedDoctorId) => {
    try {
      const response = await fetch(`http://localhost:8084/api/appointments/doctor/${resolvedDoctorId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        
        // Fetch patient details for each appointment
        const patientPromises = data.map(async (appointment) => {
          if (appointment.patientId && !patients[appointment.patientId]) {
            const patientResponse = await fetch(`http://localhost:8086/api/patient/${appointment.patientId}`);
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              return { [appointment.patientId]: patientData };
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
      }
    } catch (requestError) {
      console.error('Error fetching appointments:', requestError);
      setError('Failed to load appointment data for this doctor.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const patient = patients[apt.patientId];
        const searchLower = searchTerm.toLowerCase();
        return (
          apt.doctorName?.toLowerCase().includes(searchLower) ||
          apt.consultationType?.toLowerCase().includes(searchLower) ||
          patient?.firstName?.toLowerCase().includes(searchLower) ||
          patient?.lastName?.toLowerCase().includes(searchLower) ||
          patient?.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        aptDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'TODAY':
            return aptDate.getTime() === today.getTime();
          case 'UPCOMING':
            return aptDate >= today;
          case 'PAST':
            return aptDate < today;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));
    
    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_PAYMENT': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const downloadMedicalReport = (fileUrl, title) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <h1 className="text-3xl font-bold text-gray-900 font-display">Appointments</h1>
                <p className="text-gray-600 mt-2">Manage your patient appointments and consultations</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Appointments:</span>
                  <span className="ml-2 font-semibold text-medilink-primary">{filteredAppointments.length}</span>
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
                      placeholder="Search by patient name, email, or appointment type..."
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
                    <Filter className="w-4 h-4" />
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
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                      <option value="CONFIRMED">Confirmed</option>
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

          {/* Appointments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">{error || 'Try adjusting your search or filters'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {filteredAppointments.map((appointment) => {
                const patient = patients[appointment.patientId];
                return (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                            {appointment.consultationType === 'TELEMEDICINE' ? (
                              <Video className="w-6 h-6 text-white" />
                            ) : (
                              <Stethoscope className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.consultationType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span>{appointment.status.replace('_', ' ')}</span>
                          </span>
                          <button
                            onClick={() => setSelectedAppointment(selectedAppointment?.id === appointment.id ? null : appointment)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${selectedAppointment?.id === appointment.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Date</p>
                            <p className="text-sm text-gray-600">{formatDate(appointment.appointmentDateTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Time</p>
                            <p className="text-sm text-gray-600">{formatTime(appointment.appointmentDateTime)} ({appointment.durationMinutes} min)</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Consultation Fee</p>
                            <p className="text-sm text-gray-600">Rs {appointment.consultationFee?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Patient Details */}
                      {selectedAppointment?.id === appointment.id && patient && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-up">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Full Name</p>
                                  <p className="text-sm text-gray-600">{patient.firstName} {patient.lastName}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Email</p>
                                  <p className="text-sm text-gray-600">{patient.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Phone</p>
                                  <p className="text-sm text-gray-600">{patient.phone}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Address</p>
                                  <p className="text-sm text-gray-600">{patient.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                                  <p className="text-sm text-gray-600">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">NIC</p>
                                  <p className="text-sm text-gray-600">{patient.nic}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-2">Medical Reports</p>
                                {patient.medicalReports && patient.medicalReports.length > 0 ? (
                                  <div className="space-y-2">
                                    {patient.medicalReports.map((report) => (
                                      <div key={report.recordId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <FileText className="w-4 h-4 text-medilink-primary" />
                                          <span className="text-sm text-gray-700">{report.title}</span>
                                        </div>
                                        <button
                                          onClick={() => downloadMedicalReport(report.fileUrl, report.title)}
                                          className="p-1 hover:bg-medilink-primary hover:text-white rounded transition-colors"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No medical reports available</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-6">
                              <p className="text-sm font-medium text-gray-900 mb-2">Appointment Notes</p>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                              </div>
                            </div>
                          )}
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

export default AppointmentsPage;
