import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  ChevronDown,
  X,
  User,
  Calendar,
  Clock,
  Pill,
  Edit,
  Trash2,
  Download,
  Filter as FilterIcon,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Heart,
  Activity,
  XCircle
} from 'lucide-react';

const PrescriptionsPage = () => {
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchByNIC, setSearchByNIC] = useState(false);

  const DOCTOR_ID = '69dda11899183b33e3e63c9f';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, statusFilter, dateFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Replace with actual prescription API endpoint
      const response = await fetch(`http://localhost:8083/api/prescriptions/doctor/${DOCTOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionById = async (id) => {
    try {
      // Mock API call - replace with actual endpoint
      const prescription = prescriptions.find(p => p.id === id);
      if (prescription) {
        setSelectedPrescription(prescription);
        return prescription;
      }
    } catch (error) {
      console.error('Error fetching prescription by ID:', error);
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

  const handlePatientSearch = async () => {
    if (patientSearchTerm.trim()) {
      if (searchByNIC) {
        await fetchPatientByNIC(patientSearchTerm.trim());
      } else {
        // For general search, you could implement patient search by name
        console.log('General patient search not implemented yet');
      }
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(prescription => 
        prescription.patientName?.toLowerCase().includes(searchLower) ||
        prescription.diagnosis?.toLowerCase().includes(searchLower) ||
        prescription.status?.toLowerCase().includes(searchLower) ||
        prescription.medications?.some(med => 
          med.name?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(prescription => {
        const prescriptionDate = new Date(prescription.prescriptionDate);
        prescriptionDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'TODAY':
            return prescriptionDate.getTime() === today.getTime();
          case 'UPCOMING':
            return prescriptionDate >= today;
          case 'PAST':
            return prescriptionDate < today;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
    
    setFilteredPrescriptions(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <Activity className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'EXPIRED': return <AlertCircle className="w-4 h-4" />;
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

  const handleSearchById = async () => {
    if (prescriptionId.trim()) {
      await fetchPrescriptionById(prescriptionId.trim());
    }
  };

  const downloadPrescription = (prescription) => {
    // Create a printable version of the prescription
    const printContent = `
PRESCRIPTION
====================
Patient: ${prescription.patientName}
Doctor: ${prescription.doctorName}
Date: ${formatDate(prescription.prescriptionDate)}
Status: ${prescription.status}

DIAGNOSIS:
${prescription.diagnosis}

MEDICATIONS:
${prescription.medications.map((med, index) => `
${index + 1}. ${med.name}
   Dosage: ${med.dosage}
   Frequency: ${med.frequency}
   Duration: ${med.duration}
   Instructions: ${med.instructions}
`).join('')}

NOTES:
${prescription.notes}

====================
    `;
    
    const blob = new Blob([printContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription_${prescription.id}_${prescription.patientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                <h1 className="text-3xl font-bold text-gray-900 font-display">Prescriptions</h1>
                <p className="text-gray-600 mt-2">Manage patient prescriptions and medications</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowNewPrescription(!showNewPrescription)}
                  className="flex items-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Prescription</span>
                </button>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Prescriptions:</span>
                  <span className="ml-2 font-semibold text-medilink-primary">{filteredPrescriptions.length}</span>
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
                      placeholder="Search by patient name, diagnosis, or medication..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Search by ID */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Prescription ID"
                    value={prescriptionId}
                    onChange={(e) => setPrescriptionId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchById();
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSearchById}
                    disabled={!prescriptionId.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-medilink-success text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search ID</span>
                  </button>
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
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="EXPIRED">Expired</option>
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
                        setPrescriptionId('');
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

          {/* New Prescription Form */}
          {showNewPrescription && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Issue New Prescription</h2>
                  <button
                    onClick={() => {
                      setShowNewPrescription(false);
                      setSelectedPatient(null);
                      setPatientSearchTerm('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Patient Selection Section */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Patient Selection
                  </h3>
                  
                  {!selectedPatient ? (
                    <div>
                      <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder={searchByNIC ? "Enter patient NIC number..." : "Search for patient..."}
                              value={patientSearchTerm}
                              onChange={(e) => setPatientSearchTerm(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handlePatientSearch();
                                }
                              }}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSearchByNIC(!searchByNIC);
                              setPatientSearchTerm('');
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

                          <button
                            onClick={handlePatientSearch}
                            disabled={!patientSearchTerm.trim()}
                            className="flex items-center space-x-2 px-4 py-2 bg-medilink-success text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Search className="w-4 h-4" />
                            <span>Search Patient</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Please select a patient before issuing a prescription. Use NIC search for accurate patient identification.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">NIC: {selectedPatient.nic}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPatient(null);
                            setPatientSearchTerm('');
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedPatient.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedPatient.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedPatient.address}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Age:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prescription Form - Only show when patient is selected */}
                {selectedPatient && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                        <input
                          type="text"
                          value={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                          placeholder="Enter diagnosis"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                            placeholder="Medication name"
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                            placeholder="Dosage (e.g., 10mg)"
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                            placeholder="Frequency (e.g., Once daily)"
                          />
                          <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                            placeholder="Duration (e.g., 30 days)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        placeholder="Special instructions for patient"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        placeholder="Any additional notes for the prescription"
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => setShowNewPrescription(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button className="px-6 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors">
                        Issue Prescription
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Prescriptions List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prescriptions Grid */}
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="bg-white rounded-xl shadow-medical border border-gray-200 hover:shadow-medical-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPrescription(selectedPrescription?.id === prescription.id ? null : prescription)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {prescription.patientName}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                                {getStatusIcon(prescription.status)}
                                <span>{prescription.status}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {prescription.id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPrescription(prescription);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Date</p>
                            <p className="text-sm text-gray-600">{formatDate(prescription.prescriptionDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Diagnosis</p>
                            <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                          </div>
                        </div>
                      </div>

                      {/* Medications Preview */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Pill className="w-4 h-4 text-medilink-primary" />
                            <span className="text-sm font-medium text-gray-900">
                              {prescription.medications.length} Medication{prescription.medications.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Click to view details</span>
                        </div>
                        <div className="space-y-2">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              {med.name} - {med.dosage} - {med.frequency}
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="text-xs text-gray-500">+{prescription.medications.length - 2} more...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prescription Details Panel */}
              <div className="lg:sticky lg:top-6 h-fit">
                {selectedPrescription ? (
                  <div className="bg-white rounded-xl shadow-medical border border-gray-200 animate-slide-up">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Prescription Details</h3>
                        <button
                          onClick={() => setSelectedPrescription(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedPrescription.patientName}
                          </h4>
                          <p className="text-sm text-gray-600">Prescription ID: {selectedPrescription.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Prescription Information */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Prescription Information
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Doctor</span>
                            <span className="text-sm font-medium text-gray-900">{selectedPrescription.doctorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date Issued</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(selectedPrescription.prescriptionDate)} at {formatTime(selectedPrescription.prescriptionDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                              {selectedPrescription.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Heart className="w-4 h-4 mr-2" />
                          Diagnosis
                        </h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{selectedPrescription.diagnosis}</p>
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Pill className="w-4 h-4 mr-2" />
                          Medications
                        </h5>
                        <div className="space-y-3">
                          {selectedPrescription.medications.map((medication, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h6 className="font-medium text-gray-900">{medication.name}</h6>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Dosage:</span>
                                  <span className="font-medium text-gray-900 ml-1">{medication.dosage}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Frequency:</span>
                                  <span className="font-medium text-gray-900 ml-1">{medication.frequency}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Duration:</span>
                                  <span className="font-medium text-gray-900 ml-1">{medication.duration}</span>
                                </div>
                              </div>
                              {medication.instructions && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <span className="text-gray-600">Instructions:</span>
                                  <p className="text-sm text-gray-700 mt-1">{medication.instructions}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedPrescription.notes && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-3">Additional Notes</h5>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700">{selectedPrescription.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => downloadPrescription(selectedPrescription)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </button>
                          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-medilink-success text-white rounded-lg hover:bg-green-600 transition-colors">
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Prescription</h3>
                    <p className="text-sm text-gray-600">Click on a prescription card to view detailed information</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrescriptionsPage;