import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Video, 
  Building, 
  Stethoscope, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter as FilterIcon,
  ChevronDown,
  X,
  User
} from 'lucide-react';

const FindDoctorsPage = () => {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [telemedicineFilter, setTelemedicineFilter] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, specialtyFilter, statusFilter, telemedicineFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors and hospitals in parallel
      const [doctorsResponse, hospitalsResponse] = await Promise.all([
        fetch('http://localhost:8083/api/doctors'),
        fetch('http://localhost:8083/api/hospitals')
      ]);

      if (doctorsResponse.ok && hospitalsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        const hospitalsData = await hospitalsResponse.json();
        
        setDoctors(doctorsData);
        
        // Create hospital mapping from API response
        const hospitalMap = {};
        hospitalsData.forEach(hospital => {
          hospitalMap[hospital.hospitalId] = hospital.name;
        });
        setHospitals(hospitalMap);
      }
    } catch (error) {
      console.error('Error fetching doctors or hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchLower) ||
        doctor.email?.toLowerCase().includes(searchLower) ||
        doctor.specialty?.toLowerCase().includes(searchLower) ||
        doctor.licenseNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Specialty filter
    if (specialtyFilter !== 'ALL') {
      filtered = filtered.filter(doctor => doctor.specialty === specialtyFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    // Telemedicine filter
    if (telemedicineFilter !== 'ALL') {
      if (telemedicineFilter === 'YES') {
        filtered = filtered.filter(doctor => doctor.availableForTelemedicine === true);
      } else {
        filtered = filtered.filter(doctor => doctor.availableForTelemedicine === false);
      }
    }

    setFilteredDoctors(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'REJECTED': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSpecialties = () => {
    const specialties = [...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))];
    return specialties.sort();
  };

  const getHospitalNames = (hospitalIds) => {
    return hospitalIds.map(id => hospitals[id] || `Hospital (${id.slice(-8)})`).join(', ');
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
                <h1 className="text-3xl font-bold text-gray-900 font-display">Find Doctors</h1>
                <p className="text-gray-600 mt-2">Browse and search all registered doctors</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Doctors:</span>
                  <span className="ml-2 font-semibold text-medilink-primary">{filteredDoctors.length}</span>
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
                      placeholder="Search by name, email, specialty, or license number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Filter Button */}
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
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select
                      value={specialtyFilter}
                      onChange={(e) => setSpecialtyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Specialties</option>
                      {getSpecialties().map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telemedicine</label>
                    <select
                      value={telemedicineFilter}
                      onChange={(e) => setTelemedicineFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All</option>
                      <option value="YES">Available</option>
                      <option value="NO">Not Available</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSpecialtyFilter('ALL');
                        setStatusFilter('ALL');
                        setTelemedicineFilter('ALL');
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

          {/* Doctors List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.doctorId}
                  className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedDoctor(selectedDoctor?.doctorId === doctor.doctorId ? null : doctor)}
                >
                  <div className="p-6">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doctor.status)}`}>
                              {getStatusIcon(doctor.status)}
                              <span>{doctor.status}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {doctor.doctorId.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specialty and Experience */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{doctor.specialty}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{doctor.yearsOfExperience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">License: {doctor.licenseNumber}</span>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{doctor.phone}</span>
                      </div>
                    </div>

                    {/* Hospitals */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">Hospitals</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getHospitalNames(doctor.hospitalIds)}
                      </div>
                    </div>

                    {/* Fee and Telemedicine */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-medilink-primary">Rs {doctor.fee.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">consultation fee</span>
                      </div>
                      {doctor.availableForTelemedicine && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-full">
                          <Video className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Telemedicine</span>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Indicator */}
                    <div className="flex items-center justify-center pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {selectedDoctor?.doctorId === doctor.doctorId ? 'Click to collapse' : 'Click for details'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedDoctor?.doctorId === doctor.doctorId && (
                    <div className="border-t border-gray-200 p-6 animate-slide-up">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Doctor Details</h4>
                      
                      <div className="space-y-4">
                        {/* Professional Information */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Professional Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Doctor ID:</span>
                              <span className="ml-2 font-medium text-gray-900">{doctor.doctorId}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">License Number:</span>
                              <span className="ml-2 font-medium text-gray-900">{doctor.licenseNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Specialty:</span>
                              <span className="ml-2 font-medium text-gray-900">{doctor.specialty}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Experience:</span>
                              <span className="ml-2 font-medium text-gray-900">{doctor.yearsOfExperience} years</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Contact Details</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-gray-900">{doctor.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium text-gray-900">{doctor.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hospital Affiliations */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Hospital Affiliations</h5>
                          <div className="space-y-2">
                            {doctor.hospitalIds.map((hospitalId, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{hospitals[hospitalId] || 'Unknown Hospital'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Services */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Services</h5>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full text-sm">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-green-800">In-Person Consultation</span>
                            </div>
                            {doctor.availableForTelemedicine && (
                              <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-full text-sm">
                                <Video className="w-3 h-3 text-blue-600" />
                                <span className="text-blue-800">Telemedicine</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Consultation Fee */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Consultation Fee</h5>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-medilink-primary">Rs {doctor.fee.toFixed(2)}</span>
                              <span className="text-sm text-gray-600">per consultation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FindDoctorsPage;
