import React, { useState, useEffect } from 'react'

// Helper function to format date for Java LocalDateTime
const formatToLocalDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const PrescriptionWriting = () => {
    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showPatientSearch, setShowPatientSearch] = useState(true)

    const [formData, setFormData] = useState({
        doctorId: '',
        patientId: '',
        diagnosis: '',
        medicines: '',
        dosageInstructions: '',
        duration: '',
        notes: ''
    })

    // Fetch patients from patient service
    const fetchPatients = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8086/api/patient')
            if (response.ok) {
                const data = await response.json()
                setPatients(data)
            } else {
                setMessage('Error fetching patients')
            }
        } catch (error) {
            setMessage('Error connecting to patient service')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    // Filter patients based on search term (excluding NIC)
    const filteredPatients = patients.filter(patient => {
        if (!patient) return false
        const searchLower = searchTerm.toLowerCase()
        return (
            (patient.firstName && patient.firstName.toLowerCase().includes(searchLower)) ||
            (patient.lastName && patient.lastName.toLowerCase().includes(searchLower)) ||
            (patient.patientId && patient.patientId.toLowerCase().includes(searchLower)) ||
            (patient.email && patient.email.toLowerCase().includes(searchLower))
        )
    })

    const handlePatientSelect = (patient) => {
        if (!patient || !patient.id) {
            setMessage('Invalid patient selected')
            return
        }
        setSelectedPatient(patient)
        setFormData(prev => ({
            ...prev,
            patientId: patient.id
        }))
        setShowPatientSearch(false)
        setSearchTerm('')
        setMessage('')
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedPatient) {
            setMessage('Please select a patient')
            return
        }

        if (!formData.diagnosis.trim()) {
            setMessage('Please enter diagnosis')
            return
        }

        if (!formData.medicines.trim()) {
            setMessage('Please enter medicines')
            return
        }

        if (!formData.dosageInstructions.trim()) {
            setMessage('Please enter dosage instructions')
            return
        }

        if (!formData.duration.trim()) {
            setMessage('Please enter duration')
            return
        }

        try {
            setLoading(true)
            const prescriptionData = {
                doctorId: '69d0d87deefb94accd94de77',
                patientId: selectedPatient.id,
                diagnosis: formData.diagnosis.trim(),
                medicines: formData.medicines.trim(),
                dosageInstructions: formData.dosageInstructions.trim(),
                duration: formData.duration.trim(),
                notes: formData.notes.trim(),
                prescribedDate: formatToLocalDateTime(new Date()),
                createdAt: formatToLocalDateTime(new Date())
            }

            console.log(prescriptionData);

            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prescriptionData)
            })

            if (response.ok) {
                setMessage('Prescription issued successfully!')
                // Reset form
                setFormData({
                    doctorId: '',
                    patientId: '',
                    diagnosis: '',
                    medicines: '',
                    dosageInstructions: '',
                    duration: '',
                    notes: ''
                })
                setSelectedPatient(null)
                setShowPatientSearch(true)
            } else {
                setMessage('Error issuing prescription')
            }
        } catch (error) {
            setMessage('Error connecting to server')
        } finally {
            setLoading(false)
        }
    }

    const handleNewPatient = () => {
        setSelectedPatient(null)
        setShowPatientSearch(true)
        setSearchTerm('')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prescription Writing</h1>

                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <p className="font-medium">{message}</p>
                            </div>
                        )}

                        {/* Patient Selection Section */}
                        <div className="bg-blue-50 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Selection</h2>

                            {selectedPatient ? (
                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {selectedPatient.firstName || 'Unknown'} {selectedPatient.lastName || ''}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">ID: {selectedPatient.patientId || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">NIC: {selectedPatient.nic || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">Email: {selectedPatient.email || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">Phone: {selectedPatient.phone || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">DOB: {selectedPatient.dateOfBirth || 'N/A'}</p>
                                        </div>
                                        <button
                                            onClick={handleNewPatient}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Change Patient
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search patients by name, ID, or email..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">Loading patients...</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto bg-white rounded-lg border border-gray-200">
                                            {filteredPatients.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-600">No patients found</p>
                                                    {searchTerm && (
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Try searching with different terms
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                filteredPatients.map((patient, index) => {
                                                    if (!patient || !patient.id) return null
                                                    return (
                                                        <div
                                                            key={patient.id || index}
                                                            onClick={() => handlePatientSelect(patient)}
                                                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {patient.firstName || 'Unknown'} {patient.lastName || ''}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        ID: {patient.patientId || 'N/A'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {patient.email || 'N/A'} | {patient.phone || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-blue-600">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Prescription Form */}
                        {selectedPatient && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Prescription Details</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                                                Diagnosis *
                                            </label>
                                            <textarea
                                                id="diagnosis"
                                                name="diagnosis"
                                                value={formData.diagnosis}
                                                onChange={handleFormChange}
                                                required
                                                rows={3}
                                                placeholder="Enter diagnosis..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="medicines" className="block text-sm font-medium text-gray-700 mb-2">
                                                Medicines *
                                            </label>
                                            <textarea
                                                id="medicines"
                                                name="medicines"
                                                value={formData.medicines}
                                                onChange={handleFormChange}
                                                required
                                                rows={4}
                                                placeholder="Enter prescribed medicines (one per line or separate with commas)..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="dosageInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                                                Dosage Instructions *
                                            </label>
                                            <textarea
                                                id="dosageInstructions"
                                                name="dosageInstructions"
                                                value={formData.dosageInstructions}
                                                onChange={handleFormChange}
                                                required
                                                rows={3}
                                                placeholder="Enter dosage instructions (e.g., 'Take twice daily after meals')..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Duration *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="duration"
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleFormChange}
                                                    required
                                                    placeholder="e.g., 7 days, 2 weeks, 1 month"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Additional Notes
                                                </label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleFormChange}
                                                    rows={3}
                                                    placeholder="Any additional notes or instructions..."
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Issuing Prescription...' : 'Issue Prescription'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNewPatient}
                                        className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                    >
                                        New Patient
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrescriptionWriting
