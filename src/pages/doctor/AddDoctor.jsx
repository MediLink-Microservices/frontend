import React, { useState, useEffect } from 'react'
import AllRegisteredDoctors from '../../components/AllRegisteredDoctors'

const AddDoctor = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        yearsOfExperience: 0,
        specialty: '',
        hospitalIds: [],
        fee: 0,
        availableForTelemedicine: false
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const specializations = [
        { value: 'GENERAL_PRACTICE', label: 'General Practice' },
        { value: 'CARDIOLOGY', label: 'Cardiology' },
        { value: 'NEUROLOGY', label: 'Neurology' },
        { value: 'PEDIATRICS', label: 'Pediatrics' },
        { value: 'ORTHOPEDICS', label: 'Orthopedics' },
        { value: 'DERMATOLOGY', label: 'Dermatology' },
        { value: 'PSYCHIATRY', label: 'Psychiatry' },
        { value: 'GYNECOLOGY', label: 'Gynecology' },
        { value: 'OPHTHALMOLOGY', label: 'Ophthalmology' }
    ]

    const hospitalTypes = [
        { value: 'HOSPITAL', label: 'Hospital' },
        { value: 'CLINIC', label: 'Clinic' },
        { value: 'NURSING_HOME', label: 'Nursing Home' },
        { value: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' }
    ]

    const [availableHospitals, setAvailableHospitals] = useState([])

    const fetchAvailableHospitals = async () => {
        try {
            console.log('Fetching available hospitals')
            const response = await fetch('/api/hospitals')
            if (response.ok) {
                const data = await response.json()
                setAvailableHospitals(data)
            } else {
                console.error('Failed to fetch hospitals')
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error)
        }
    }

    React.useEffect(() => {
        fetchAvailableHospitals()
    }, [])

    const handleHospitalSelection = (hospitalId) => {
        setFormData(prev => ({
            ...prev,
            hospitalIds: prev.hospitalIds.includes(hospitalId)
                ? prev.hospitalIds.filter(id => id !== hospitalId)
                : [...prev.hospitalIds, hospitalId]
        }))
    }

    const handleRemoveHospital = (hospitalIdToRemove) => {
        setFormData(prev => ({
            ...prev,
            hospitalIds: prev.hospitalIds.filter(id => id !== hospitalIdToRemove)
        }))
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        console.log('Form submitted with data:', formData);
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/doctors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setMessage('Doctor added successfully!')
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    licenseNumber: '',
                    yearsOfExperience: 0,
                    specialty: '',
                    hospitalIds: [],
                    fee: 0,
                    availableForTelemedicine: false
                })
            } else {
                setMessage('Error adding doctor. Please try again.')
            }
        } catch (error) {
            setMessage('Error connecting to server')
        } finally {
            setLoading(false)
        }
    }

    const renderHospitalSelection = () => {
        return (
            <div className="hospital-selection-section">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Hospitals</h3>
                <div className="hospitals-list">
                    {availableHospitals.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800">No hospitals available. Please add hospitals first.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {availableHospitals.map(hospital => (
                                <div key={hospital.hospitalId} className="hospital-item">
                                    <label className="flex items-center p-4 border border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.hospitalIds.includes(hospital.hospitalId)}
                                            onChange={() => handleHospitalSelection(hospital.hospitalId)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{hospital.name}</span>
                                            <span className="text-sm text-gray-500 ml-2">({getTypeLabel(hospital.type)})</span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {formData.hospitalIds.length === 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">Please select at least one hospital</p>
                    </div>
                )}
            </div>
        )
    }

    const getTypeLabel = (type) => {
        const typeMap = {
            'HOSPITAL': 'Hospital',
            'CLINIC': 'Clinic',
            'NURSING_HOME': 'Nursing Home',
            'DIAGNOSTIC_CENTER': 'Diagnostic Center'
        }
        return typeMap[type] || type
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Doctor</h1>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <p className="font-medium">{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter doctor's full name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                                    <input
                                        type="text"
                                        id="licenseNumber"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter medical license number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                                    <input
                                        type="number"
                                        id="yearsOfExperience"
                                        name="yearsOfExperience"
                                        value={formData.yearsOfExperience}
                                        onChange={(e) => setFormData(prev => ({...prev, yearsOfExperience: parseInt(e.target.value) || 0}))}
                                        required
                                        placeholder="Enter years of experience"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                                    <select
                                        id="specialty"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Specialty</option>
                                        {specializations.map(spec => (
                                            <option key={spec.value} value={spec.value}>
                                                {spec.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (රු) *</label>
                                    <input
                                        type="number"
                                        id="fee"
                                        name="fee"
                                        value={formData.fee}
                                        onChange={(e) => setFormData(prev => ({...prev, fee: parseFloat(e.target.value) || 0}))}
                                        required
                                        placeholder="Enter consultation fee"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="availableForTelemedicine"
                                            checked={formData.availableForTelemedicine}
                                            onChange={handleChange}
                                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Available for Telemedicine</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Association */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hospital Association</h2>
                            {renderHospitalSelection()}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={loading || formData.hospitalIds.length === 0}
                                className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? 'Adding...' : 'Add Doctor'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    name: '',
                                    email: '',
                                    phone: '',
                                    licenseNumber: '',
                                    yearsOfExperience: 0,
                                    specialty: '',
                                    hospitalIds: [],
                                    fee: 0,
                                    availableForTelemedicine: false
                                })}
                                className="flex-1 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                Clear Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <AllRegisteredDoctors />

        </div>
    )
}

export default AddDoctor
