import React, { useState } from 'react'
import AllMedicalLocations from '../../components/AllMedicalLocations'

const MedicalLocation = () => {
    const [showForm, setShowForm] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        province: '',
        telephone: '',
        email: '',
        type: 'HOSPITAL',
        isActive: true
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const hospitalTypes = [
        { value: 'HOSPITAL', label: 'Hospital' },
        { value: 'CLINIC', label: 'Clinic' },
        { value: 'NURSING_HOME', label: 'Nursing Home' },
        { value: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' }
    ]

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        console.log("Form data:", formData);
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Remove isActive from the data sent to backend
            const { isActive, ...apiData } = formData
            const response = await fetch('/api/hospitals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            })

            if (response.ok) {
                setMessage('Hospital added successfully!')
                setFormData({
                    name: '',
                    address: '',
                    city: '',
                    province: '',
                    telephone: '',
                    email: '',
                    type: 'HOSPITAL',
                    isActive: true
                })
                // Refresh the list component
                setRefreshKey(prev => prev + 1)
                // Switch to list view to show the new location
                setShowForm(false)
            } else {
                setMessage('Error adding hospital. Please try again.')
            }
        } catch (error) {
            setMessage('Error connecting to server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="medical-location-page">
            <div className="page-header">
                <h1>Medical Locations Management</h1>
                <div className="toggle-buttons">
                    <button 
                        className={`toggle-btn ${showForm ? 'active' : ''}`}
                        onClick={() => setShowForm(true)}
                    >
                        Add Location
                    </button>
                    <button 
                        className={`toggle-btn ${!showForm ? 'active' : ''}`}
                        onClick={() => setShowForm(false)}
                    >
                        View All Locations
                    </button>
                </div>
            </div>

            {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {showForm ? (
                <div className="medical-location-form">
                    <h2>Add New Medical Location</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Hospital Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter hospital name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Enter street address"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter city"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="province">Province *</label>
                                <input
                                    type="text"
                                    id="province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter province"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="telephone">Telephone *</label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter telephone number"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="type">Hospital Type *</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                {hospitalTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Active Hospital
                            </label>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Hospital'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setFormData({
                                    name: '',
                                    address: '',
                                    city: '',
                                    province: '',
                                    telephone: '',
                                    email: '',
                                    type: 'HOSPITAL',
                                    isActive: true
                                })}
                            >
                                Clear Form
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <AllMedicalLocations key={refreshKey} />
            )}
        </div>
    )
}

export default MedicalLocation