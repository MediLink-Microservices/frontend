import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Download,
  Filter,
  ChevronDown,
  X,
  Activity,
  Heart,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter as FilterIcon
} from 'lucide-react';

const PatientsPage = () => {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NAME');
  const [searchByNIC, setSearchByNIC] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    fetchPatients();
  }, []);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchTerm, ageFilter, sortBy]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8086/api/patient');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:8086/api/patient/${patientId}`);
      if (response.ok) {
        const patientData = await response.json();
        setSelectedPatient(patientData);
        return patientData;
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
    return null;
  };

  const fetchPatientByNIC = async (nic) => {
    try {
      const response = await fetch(`http://localhost:8086/api/patient/nic/${nic}`);
      if (response.ok) {
        const patientData = await response.json();
        setSelectedPatient(patientData);
        return patientData;
      }
    } catch (error) {
      console.error('Error fetching patient by NIC:', error);
    }
    return null;
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(searchTerm) ||
        patient.nic?.toLowerCase().includes(searchLower)
      );
    }

    // Age filter
    if (ageFilter !== 'ALL') {
      filtered = filtered.filter(patient => {
        const age = calculateAge(patient.dateOfBirth);
        switch (ageFilter) {
          case 'YOUNG': return age < 18;
          case 'ADULT': return age >= 18 && age < 65;
          case 'SENIOR': return age >= 65;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'NAME':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'EMAIL':
          return a.email?.localeCompare(b.email) || 0;
        case 'AGE':
          return calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth);
        case 'RECENT':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchByNIC = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      await fetchPatientByNIC(searchTerm.trim());
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (searchByNIC) {
      setSelectedPatient(null); // Clear selected patient when switching search modes
    }
  };

  const getAgeGroupColor = (age) => {
    if (age < 18) return 'bg-blue-100 text-blue-800';
    if (age >= 18 && age < 65) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getAgeGroupLabel = (age) => {
    if (age < 18) return 'Young';
    if (age >= 18 && age < 65) return 'Adult';
    return 'Senior';
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
                <h1 className="text-3xl font-bold text-gray-900 font-display">Patients</h1>
                <p className="text-gray-600 mt-2">Manage patient records and medical history</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Patients:</span>
                  <span className="ml-2 font-semibold text-medilink-primary">{filteredPatients.length}</span>
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
                      placeholder={searchByNIC ? "Enter patient NIC number..." : "Search by name, email, phone, or NIC..."}
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchByNIC) {
                          handleSearchByNIC();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Search Mode Toggle and Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSearchByNIC(!searchByNIC);
                      setSearchTerm('');
                      setSelectedPatient(null);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                      searchByNIC 
                        ? 'bg-medilink-primary text-white border-medilink-primary' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{searchByNIC ? 'NIC Search' : 'General Search'}</span>
                  </button>
                  
                  {searchByNIC && (
                    <button
                      onClick={handleSearchByNIC}
                      disabled={loading || !searchTerm.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-medilink-success text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search NIC</span>
                    </button>
                  )}
                  
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                    <select
                      value={ageFilter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Ages</option>
                      <option value="YOUNG">Young (&lt;18)</option>
                      <option value="ADULT">Adult (18-64)</option>
                      <option value="SENIOR">Senior (65+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="NAME">Name</option>
                      <option value="EMAIL">Email</option>
                      <option value="AGE">Age</option>
                      <option value="RECENT">Recently Added</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setAgeFilter('ALL');
                        setSortBy('NAME');
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

          {/* Patients List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          ) : searchByNIC && selectedPatient ? (
            // Show only selected patient when using NIC search
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(calculateAge(selectedPatient.dateOfBirth))}`}>
                              {getAgeGroupLabel(calculateAge(selectedPatient.dateOfBirth))} ({calculateAge(selectedPatient.dateOfBirth)} years)
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {selectedPatient.id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600 truncate">{selectedPatient.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600 truncate">{selectedPatient.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">DOB: {formatDate(selectedPatient.dateOfBirth)}</p>
                      </div>
                    </div>

                    {selectedPatient.medicalReports && selectedPatient.medicalReports.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-medilink-primary" />
                            <span className="text-sm font-medium text-gray-900">
                              {selectedPatient.medicalReports.length} Medical Report{selectedPatient.medicalReports.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Patient found via NIC search</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : !searchByNIC && filteredPatients.length === 0 ? (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : !searchByNIC ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patients Grid */}
              <div className="space-y-4">
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.dateOfBirth);
                  return (
                    <div
                      key={patient.id}
                      className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300 cursor-pointer"
                      onClick={() => fetchPatientDetails(patient.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(age)}`}>
                                  {getAgeGroupLabel(age)} ({age} years)
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {patient.id.slice(-8)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 truncate">{patient.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600 truncate">{patient.address}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600">DOB: {formatDate(patient.dateOfBirth)}</p>
                          </div>
                        </div>

                        {/* Medical Reports Preview */}
                        {patient.medicalReports && patient.medicalReports.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-medilink-primary" />
                                <span className="text-sm font-medium text-gray-900">
                                  {patient.medicalReports.length} Medical Report{patient.medicalReports.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">Click to view details</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patient Details Panel */}
              <div className="lg:sticky lg:top-6 h-fit">
                {selectedPatient ? (
                  <div className="bg-white rounded-xl shadow-medical border border-gray-200 animate-slide-up">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">Patient ID: {selectedPatient.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Personal Information
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Full Name</span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">NIC</span>
                            <span className="text-sm font-medium text-gray-900">{selectedPatient.nic}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date of Birth</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(selectedPatient.dateOfBirth)} ({calculateAge(selectedPatient.dateOfBirth)} years)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Information
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email</span>
                            <span className="text-sm font-medium text-gray-900">{selectedPatient.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Phone</span>
                            <span className="text-sm font-medium text-gray-900">{selectedPatient.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Address</span>
                            <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                              {selectedPatient.address}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Medical Reports */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Medical Reports
                        </h5>
                        {selectedPatient.medicalReports && selectedPatient.medicalReports.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.medicalReports.map((report) => (
                              <div key={report.recordId} className="border border-gray-200 rounded-lg p-3 hover:border-medilink-primary transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-medilink-primary" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                      <p className="text-xs text-gray-500">
                                        Uploaded: {formatDate(report.uploadDate)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => downloadMedicalReport(report.fileUrl, report.title)}
                                    className="p-2 hover:bg-medilink-primary hover:text-white rounded-lg transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No medical reports available</p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Book Appointment</span>
                          </button>
                          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-medilink-success text-white rounded-lg hover:bg-green-600 transition-colors">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">Add Prescription</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
                    <p className="text-sm text-gray-600">Click on a patient card to view detailed information</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default PatientsPage;
