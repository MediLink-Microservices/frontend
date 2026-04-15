import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  Building,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Video,
  User,
  Save,
  RefreshCw
} from 'lucide-react';

const SchedulePage = () => {
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [filterHospital, setFilterHospital] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const DOCTOR_ID = '69dda11899183b33e3e63c9f';

  // Form state
  const [formData, setFormData] = useState({
    doctorId: DOCTOR_ID,
    hospitalId: '',
    day: '',
    startTime: '',
    endTime: '',
    consultationType: 'IN_PERSON',
    isAvailable: true,
    patientLimit: 20
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const consultationTypes = ['IN_PERSON', 'TELEmedicine', 'BOTH'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchSchedules();
    fetchHospitals();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8083/api/schedules/doctor/${DOCTOR_ID}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
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
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSchedule 
        ? `http://localhost:8083/api/schedules/${editingSchedule.id}`
        : 'http://localhost:8083/api/schedules';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSchedules();
        resetForm();
        setShowAddSchedule(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await fetch(`http://localhost:8083/api/schedules/${scheduleId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchSchedules();
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: DOCTOR_ID,
      hospitalId: '',
      day: '',
      startTime: '',
      endTime: '',
      consultationType: 'IN_PERSON',
      isAvailable: true,
      patientLimit: 20
    });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId,
      hospitalId: schedule.hospitalId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      consultationType: schedule.consultationType,
      isAvailable: schedule.isAvailable,
      patientLimit: schedule.patientLimit
    });
    setShowAddSchedule(true);
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case 'TELEmedicine': return <Video className="w-4 h-4" />;
      case 'IN_PERSON': return <Users className="w-4 h-4" />;
      case 'BOTH': return <Calendar className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConsultationColor = (type) => {
    switch (type) {
      case 'TELEmedicine': return 'text-blue-600 bg-blue-50';
      case 'IN_PERSON': return 'text-green-600 bg-green-50';
      case 'BOTH': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const hospitalMatch = filterHospital === 'ALL' || schedule.hospitalId === filterHospital;
    const typeMatch = filterType === 'ALL' || schedule.consultationType === filterType;
    const dayMatch = !selectedDay || schedule.day === selectedDay;
    return hospitalMatch && typeMatch && dayMatch;
  });

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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Schedule</h1>
                <p className="text-gray-600 mt-1">Manage your weekly consultation schedule</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchSchedules}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddSchedule(true);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Schedule</span>
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Day Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Day:</span>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                  >
                    <option value="">All Days</option>
                    {weekDays.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                {/* Hospital Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Hospital:</span>
                  <select
                    value={filterHospital}
                    onChange={(e) => setFilterHospital(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                  >
                    <option value="ALL">All Hospitals</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.hospitalId} value={hospital.hospitalId}>{hospital.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                  >
                    <option value="ALL">All Types</option>
                    {consultationTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedDay('');
                    setFilterHospital('ALL');
                    setFilterType('ALL');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map(day => {
              const daySchedules = filteredSchedules.filter(s => s.day === day);
              return (
                <div key={day} className="bg-white rounded-lg border border-gray-200">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-center">{day}</h3>
                    <p className="text-xs text-gray-500 text-center">{daySchedules.length} schedule{daySchedules.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {daySchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-medilink-primary transition-colors cursor-pointer"
                        onClick={() => handleEdit(schedule)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getConsultationColor(schedule.consultationType)}`}>
                            {getConsultationIcon(schedule.consultationType)}
                            <span className="font-medium">{schedule.consultationType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {schedule.isAvailable ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Building className="w-3 h-3" />
                            <span className="truncate">{getHospitalName(schedule.hospitalId)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              <span>{schedule.patientLimit} patients</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(schedule);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Edit className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(schedule.id);
                                }}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {daySchedules.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No schedules</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add/Edit Schedule Modal */}
          {showAddSchedule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddSchedule(false);
                        setEditingSchedule(null);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hospital Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                      <select
                        value={formData.hospitalId}
                        onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map(hospital => (
                          <option key={hospital.hospitalId} value={hospital.hospitalId}>
                            {hospital.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        value={formData.day}
                        onChange={(e) => setFormData({...formData, day: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select Day</option>
                        {weekDays.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Consultation Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                      <select
                        value={formData.consultationType}
                        onChange={(e) => setFormData({...formData, consultationType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        required
                      >
                        {consultationTypes.map(type => (
                          <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>

                    {/* Patient Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Limit</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.patientLimit}
                        onChange={(e) => setFormData({...formData, patientLimit: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    {/* Available Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="w-4 h-4 text-medilink-primary focus:ring-medilink-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        Available for appointments
                      </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSchedule(false);
                          setEditingSchedule(null);
                          resetForm();
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingSchedule ? 'Update' : 'Save'} Schedule</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SchedulePage;
