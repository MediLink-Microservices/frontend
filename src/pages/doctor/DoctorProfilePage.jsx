import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/layout/DoctorSidebar';
import DoctorHeader from '../../components/layout/DoctorHeader';
import { getStoredUser } from '../../utils/authStorage';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Stethoscope,
  Building,
  Globe,
  Award,
  FileText
} from 'lucide-react';

const DoctorProfilePage = () => {
  const [user, setUser] = useState(null);
  const [storedUser, setStoredUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '', // Changed from specialization to specialty
    yearsOfExperience: '', // Changed from experience to yearsOfExperience
    qualifications: '',
    licenseNumber: '',
    fee: '', // Changed from consultationFee to fee
    hospitalIds: [], // Added hospitalIds array
    availableForTelemedicine: false, // Added telemedicine availability
    status: '', // Added status field
    address: '', // Keep existing fields
    city: '',
    country: ''
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
    setStoredUser(currentUser);
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const storedUser = getStoredUser();
      
      console.log('Stored user data:', storedUser);
      
      // First get all doctors to find the current doctor's profile
      const doctorsResponse = await fetch('/api/doctors');
      if (doctorsResponse.ok) {
        const doctors = await doctorsResponse.json();
        console.log('Available doctors:', doctors);
        
        // Find the doctor matching the logged-in user with multiple matching strategies
        let matchedDoctor = null;
        
        // Strategy 1: Match by email
        matchedDoctor = doctors.find(doctor => {
          const doctorEmail = doctor.email?.trim().toLowerCase();
          const userEmail = storedUser?.email?.trim().toLowerCase();
          return doctorEmail && userEmail && doctorEmail === userEmail;
        });
        
        // Strategy 2: Match by name if email fails
        if (!matchedDoctor && storedUser?.name) {
          const normalizedName = storedUser.name.replace(/^Dr\.?\s*/i, '').trim().toLowerCase();
          matchedDoctor = doctors.find(doctor => {
            const doctorName = doctor.name?.replace(/^Dr\.?\s*/i, '').trim().toLowerCase();
            return doctorName && doctorName === normalizedName;
          });
        }
        
        // Strategy 3: Match by ID if available
        if (!matchedDoctor && storedUser?.id) {
          matchedDoctor = doctors.find(doctor => {
            return doctor.doctorId === storedUser.id || doctor.id === storedUser.id;
          });
        }
        
        console.log('Matched doctor:', matchedDoctor);

        if (matchedDoctor) {
          setDoctorProfile(matchedDoctor);
          setFormData({
            name: matchedDoctor.name || '',
            email: matchedDoctor.email || '',
            phone: matchedDoctor.phone || '',
            specialty: matchedDoctor.specialty || '', // Updated field name
            yearsOfExperience: matchedDoctor.yearsOfExperience || '', // Updated field name
            qualifications: matchedDoctor.qualifications || '',
            licenseNumber: matchedDoctor.licenseNumber || '',
            fee: matchedDoctor.fee || '', // Updated field name
            hospitalIds: matchedDoctor.hospitalIds || [], // Added field
            availableForTelemedicine: matchedDoctor.availableForTelemedicine || false, // Added field
            status: matchedDoctor.status || '', // Added field
            address: matchedDoctor.address || '', // Keep existing
            city: matchedDoctor.city || '',
            country: matchedDoctor.country || ''
          });
        } else {
          console.error('No matching doctor found for user:', storedUser);
        }
      } else {
        console.error('Failed to fetch doctors:', doctorsResponse.status);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (doctorProfile) {
      setFormData({
        name: doctorProfile.name || '',
        email: doctorProfile.email || '',
        phone: doctorProfile.phone || '',
        specialty: doctorProfile.specialty || '', // Updated field name
        yearsOfExperience: doctorProfile.yearsOfExperience || '', // Updated field name
        qualifications: doctorProfile.qualifications || '',
        licenseNumber: doctorProfile.licenseNumber || '',
        fee: doctorProfile.fee || '', // Updated field name
        hospitalIds: doctorProfile.hospitalIds || [], // Added field
        availableForTelemedicine: doctorProfile.availableForTelemedicine || false, // Added field
        status: doctorProfile.status || '', // Added field
        address: doctorProfile.address || '', // Keep existing
        city: doctorProfile.city || '',
        country: doctorProfile.country || ''
      });
    }
  };

  const handleSave = async () => {
    if (!doctorProfile?.doctorId && !doctorProfile?.id) {
      alert('Doctor profile not found or missing ID');
      return;
    }

    try {
      const doctorId = doctorProfile.doctorId || doctorProfile.id;
      console.log('Updating doctor with ID:', doctorId);
      console.log('Form data:', formData);
      
      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setDoctorProfile(updatedProfile);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="lg:ml-64">
          <DoctorHeader toggleSidebar={toggleSidebar} user={user} />
          <main className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medilink-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64">
        <DoctorHeader toggleSidebar={toggleSidebar} user={user} />
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your personal and professional information</p>
              </div>
              <div className="flex items-center space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-medilink-primary text-white rounded-lg hover:bg-medilink-secondary transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    disabled={!doctorProfile}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      doctorProfile 
                        ? 'bg-medilink-primary text-white hover:bg-medilink-secondary' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    <span>{doctorProfile ? 'Edit Profile' : 'Edit Unavailable'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {doctorProfile || storedUser ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{doctorProfile?.name || storedUser?.name || 'Doctor'}</h2>
                    <p className="text-gray-600 mb-4">{doctorProfile?.specialty || storedUser?.role || 'Doctor'}</p>
                    
                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{doctorProfile?.email || storedUser?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{doctorProfile?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.yearsOfExperience || 'Not specified'} years</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.fee ? `Rs ${doctorProfile.fee}` : 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">License Number</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.licenseNumber || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Telemedicine</span>
                      <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        doctorProfile?.availableForTelemedicine ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doctorProfile?.availableForTelemedicine ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hospitals</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.hospitalIds?.length || 0} assigned</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      {doctorProfile ? 'Professional Information' : 'User Information'}
                    </h3>
                    
                    {!doctorProfile && storedUser && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Full doctor profile not found in the system. You can view your basic information below. 
                          Please contact support to set up your complete professional profile.
                        </p>
                      </div>
                    )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={doctorProfile ? formData.name : (storedUser?.name || '')}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={doctorProfile ? formData.email : (storedUser?.email || '')}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorProfile ? formData.phone : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        name="specialty"
                        value={doctorProfile ? formData.specialty : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={doctorProfile ? formData.yearsOfExperience : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Consultation Fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                      <input
                        type="number"
                        name="fee"
                        value={doctorProfile ? formData.fee : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* License Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={doctorProfile ? formData.licenseNumber : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Status</label>
                      <select
                        name="status"
                        value={doctorProfile ? formData.status : ''}
                        onChange={handleInputChange}
                        disabled={!editing || !doctorProfile}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none ${
                          editing && doctorProfile ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option value="">Select Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    {/* Telemedicine Availability */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="availableForTelemedicine"
                          checked={doctorProfile ? formData.availableForTelemedicine : false}
                          onChange={handleInputChange}
                          disabled={!editing || !doctorProfile}
                          className={`rounded border-gray-300 text-medilink-primary focus:ring-medilink-primary ${
                            editing && doctorProfile ? 'bg-white' : 'bg-gray-50 text-gray-700'
                          }`}
                        />
                        <span>Available for Telemedicine</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-medical border border-gray-200 p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600">Unable to load your profile information. Please contact support.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
