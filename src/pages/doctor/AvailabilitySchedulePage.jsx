import React, { useState, useEffect } from 'react'

const AvailabilitySchedulePage = () => {
    const [schedules, setSchedules] = useState([])
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)

    const [formData, setFormData] = useState({
        doctorId: '69d0d87deefb94accd94de77',
        hospitalId: '',
        day: 'Monday',
        startTime: '',
        endTime: '',
        consultationType: 'IN_PERSON',
        isAvailable: true,
        patientLimit: 20
    })

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]

    const consultationTypes = [
        { value: 'IN_PERSON', label: 'In Person' },
        { value: 'TELEMEDICINE', label: 'Telemedicine' },
        { value: 'BOTH', label: 'Both' }
    ]

    // Fetch current schedules
    const fetchSchedules = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/schedules')
            if (response.ok) {
                const data = await response.json()
                // Filter schedules for current doctor
                const doctorSchedules = data.filter(schedule => 
                    schedule.doctorId === '69d0d87deefb94accd94de77'
                )
                setSchedules(doctorSchedules)
            } else {
                setMessage('Error fetching schedules')
            }
        } catch (error) {
            setMessage('Error connecting to server')
        } finally {
            setLoading(false)
        }
    }

    // Fetch hospitals for selection
    const fetchHospitals = async () => {
        try {
            const response = await fetch('/api/hospitals')
            if (response.ok) {
                const data = await response.json()
                setHospitals(data)
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error)
        }
    }

    useEffect(() => {
        fetchSchedules()
        fetchHospitals()
    }, [])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.hospitalId) {
            setMessage('Please select a hospital')
            return
        }

        if (!formData.startTime || !formData.endTime) {
            setMessage('Please select start and end times')
            return
        }

        if (formData.startTime >= formData.endTime) {
            setMessage('End time must be after start time')
            return
        }

        try {
            setLoading(true)
            console.log(formData);
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setMessage('Schedule added successfully!')
                // Reset form
                setFormData({
                    doctorId: '69d0d87deefb94accd94de77',
                    hospitalId: '',
                    day: 'Monday',
                    startTime: '',
                    endTime: '',
                    consultationType: 'IN_PERSON',
                    isAvailable: true,
                    patientLimit: 20
                })
                setShowAddForm(false)
                // Refresh schedules
                fetchSchedules()
            } else {
                setMessage('Error adding schedule')
            }
        } catch (error) {
            setMessage('Error connecting to server')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                const response = await fetch(`/api/schedules/${scheduleId}`, {
                    method: 'DELETE'
                })
                if (response.ok) {
                    setMessage('Schedule deleted successfully!')
                    fetchSchedules()
                } else {
                    setMessage('Error deleting schedule')
                }
            } catch (error) {
                setMessage('Error connecting to server')
            }
        }
    }

    const getHospitalName = (hospitalId) => {
        const hospital = hospitals.find(h => h.hospitalId === hospitalId)
        return hospital ? hospital.name : 'Unknown Hospital'
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Availability Schedule</h1>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                {showAddForm ? 'Cancel' : 'Add Schedule'}
                            </button>
                        </div>
                        
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <p className="font-medium">{message}</p>
                            </div>
                        )}

                        {/* Add Schedule Form */}
                        {showAddForm && (
                            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Schedule</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                                                Hospital *
                                            </label>
                                            <select
                                                id="hospitalId"
                                                name="hospitalId"
                                                value={formData.hospitalId}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Hospital</option>
                                                {hospitals.map(hospital => (
                                                    <option key={hospital.hospitalId} value={hospital.hospitalId}>
                                                        {hospital.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                                                Day *
                                            </label>
                                            <select
                                                id="day"
                                                name="day"
                                                value={formData.day}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {daysOfWeek.map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Time *
                                            </label>
                                            <input
                                                type="time"
                                                id="startTime"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                                                End Time *
                                            </label>
                                            <input
                                                type="time"
                                                id="endTime"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700 mb-2">
                                                Consultation Type *
                                            </label>
                                            <select
                                                id="consultationType"
                                                name="consultationType"
                                                value={formData.consultationType}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {consultationTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="patientLimit" className="block text-sm font-medium text-gray-700 mb-2">
                                                Patient Limit *
                                            </label>
                                            <input
                                                type="number"
                                                id="patientLimit"
                                                name="patientLimit"
                                                value={formData.patientLimit}
                                                onChange={handleInputChange}
                                                required
                                                min="1"
                                                max="100"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isAvailable"
                                            name="isAvailable"
                                            checked={formData.isAvailable}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                                            Available for appointments
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Adding...' : 'Add Schedule'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Current Schedules */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Schedules</h2>
                            
                            {loading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Loading schedules...</p>
                                </div>
                            ) : schedules.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No schedules found</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Add your first schedule
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Hospital
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Day
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Patient Limit
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {schedules.map((schedule) => (
                                                <tr key={schedule.id || schedule.scheduleId}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getHospitalName(schedule.hospitalId)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{schedule.day}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {schedule.startTime} - {schedule.endTime}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            schedule.consultationType === 'IN_PERSON' ? 'bg-green-100 text-green-800' :
                                                            schedule.consultationType === 'TELEMEDICINE' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {schedule.consultationType.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{schedule.patientLimit}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            schedule.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {schedule.isAvailable ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDelete(schedule.id || schedule.scheduleId)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AvailabilitySchedulePage
