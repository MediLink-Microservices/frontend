import React, { useState, useEffect } from 'react'

const AllRegisteredDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      console.log('Fetching from: /api/doctors')
      const response = await fetch('/api/doctors')
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        console.log('Response not OK:', response.status, response.statusText)
        setError(`Failed to fetch doctors: ${response.status} ${response.statusText}`)
        return
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      setDoctors(data)
    } catch (error) {
      console.log('Fetch error:', error)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (doctor) => {
    setEditingId(doctor.doctorId)
    setEditFormData({ ...doctor })
  }

  const handleSave = async (id) => {
    try {
      console.log('Saving doctor with ID:', id)
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })
      console.log('Save response status:', response.status)
      if (response.ok) {
        setDoctors(doctors.map(doc => 
          doc.doctorId === id ? { ...editFormData } : doc
        ))
        setEditingId(null)
        setEditFormData({})
      } else {
        console.log('Save failed:', response.status, response.statusText)
        setError(`Failed to update doctor: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log('Save error:', error)
      setError('Error updating doctor')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        console.log(`Deleting doctor with ID: ${id}`)
        const response = await fetch(`/api/doctors/${id}`, {
          method: 'DELETE'
        })
        console.log('Delete response status:', response.status)
        if (response.ok) {
          setDoctors(doctors.filter(doctor => doctor.doctorId !== id))
        } else {
          console.log('Delete failed:', response.status, response.statusText)
          setError(`Failed to delete doctor: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log('Delete error:', error)
        setError('Error connecting to server')
      }
    }
  }

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

  const departments = [
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'OUTPATIENT', label: 'Outpatient' },
    { value: 'INPATIENT', label: 'Inpatient' },
    { value: 'SURGERY', label: 'Surgery' },
    { value: 'ICU', label: 'Intensive Care' },
    { value: 'LABORATORY', label: 'Laboratory' }
  ]

  const getSpecializationLabel = (spec) => {
    const specMap = {
      'GENERAL_PRACTICE': 'General Practice',
      'CARDIOLOGY': 'Cardiology',
      'NEUROLOGY': 'Neurology',
      'PEDIATRICS': 'Pediatrics',
      'ORTHOPEDICS': 'Orthopedics',
      'DERMATOLOGY': 'Dermatology',
      'PSYCHIATRY': 'Psychiatry',
      'GYNECOLOGY': 'Gynecology',
      'OPHTHALMOLOGY': 'Ophthalmology'
    }
    return specMap[spec] || spec
  }

  const getDepartmentLabel = (dept) => {
    const deptMap = {
      'EMERGENCY': 'Emergency',
      'OUTPATIENT': 'Outpatient',
      'INPATIENT': 'Inpatient',
      'SURGERY': 'Surgery',
      'ICU': 'Intensive Care',
      'LABORATORY': 'Laboratory'
    }
    return deptMap[dept] || dept
  }

  if (loading) {
    return <div className="loading">Loading doctors...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="all-doctors">
      <h2>All Registered Doctors</h2>
      
      {doctors.length === 0 ? (
        <div className="no-doctors">
          <p>No doctors found. Add your first doctor above.</p>
        </div>
      ) : (
        <div className="doctors-table-container">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Experience</th>
                <th>Consultation Fee</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.doctorId}>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <div className="name-edit">
                        <input
                          type="text"
                          name="firstName"
                          value={editFormData.firstName || ''}
                          onChange={handleEditChange}
                          className="edit-input small"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={editFormData.lastName || ''}
                          onChange={handleEditChange}
                          className="edit-input small"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      `${doctor.firstName} ${doctor.lastName}`
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      doctor.email
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone || ''}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      doctor.phone
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <select
                        name="specialization"
                        value={editFormData.specialization || ''}
                        onChange={handleEditChange}
                        className="edit-select"
                      >
                        {specializations.map(spec => (
                          <option key={spec.value} value={spec.value}>
                            {spec.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="spec-badge">
                        {getSpecializationLabel(doctor.specialization)}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <select
                        name="department"
                        value={editFormData.department || ''}
                        onChange={handleEditChange}
                        className="edit-select"
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="dept-badge">
                        {getDepartmentLabel(doctor.department)}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <input
                        type="number"
                        name="experience"
                        value={editFormData.experience || ''}
                        onChange={handleEditChange}
                        className="edit-input small"
                        min="0"
                      />
                    ) : (
                      `${doctor.experience} years`
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <input
                        type="number"
                        name="consultationFee"
                        value={editFormData.consultationFee || ''}
                        onChange={handleEditChange}
                        className="edit-input small"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      `$${doctor.consultationFee}`
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="available"
                          checked={editFormData.available || false}
                          onChange={handleEditChange}
                        />
                        <span className="checkmark"></span>
                        Available
                      </label>
                    ) : (
                      <span className={`status-badge ${doctor.available ? 'available' : 'unavailable'}`}>
                        {doctor.available ? 'Available' : 'Unavailable'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === doctor.doctorId ? (
                      <div className="edit-actions">
                        <button 
                          className="btn-save"
                          onClick={() => handleSave(doctor.doctorId)}
                        >
                          Save
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn-edit" onClick={() => handleEdit(doctor)}>Edit</button>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(doctor.doctorId)}
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
      
      <style jsx>{`
        .all-doctors {
          margin-top: 2rem;
        }

        h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .no-doctors {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .doctors-table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .doctors-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .doctors-table th {
          background-color: #f8f9fa;
          color: #34495e;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e1e8ed;
        }

        .doctors-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e1e8ed;
          vertical-align: middle;
        }

        .doctors-table tr:hover {
          background-color: #f8f9fa;
        }

        .name-edit {
          display: flex;
          gap: 0.5rem;
        }

        .edit-input {
          width: 100%;
          padding: 0.25rem 0.5rem;
          border: 1px solid #3498db;
          border-radius: 4px;
          font-size: 0.875rem;
          background: white;
        }

        .edit-input.small {
          width: 80px;
        }

        .edit-input:focus, .edit-select:focus {
          outline: none;
          border-color: #2980b9;
          box-shadow: 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .edit-select {
          width: 100%;
          padding: 0.25rem 0.5rem;
          border: 1px solid #3498db;
          border-radius: 4px;
          font-size: 0.875rem;
          background: white;
        }

        .spec-badge, .dept-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .spec-badge {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .dept-badge {
          background-color: #fef3c7;
          color: #f59e0b;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.available {
          background-color: #28a745;
          color: white;
        }

        .status-badge.unavailable {
          background-color: #dc3545;
          color: white;
        }

        .edit-actions {
          display: flex;
          gap: 0.25rem;
        }

        .btn-edit, .btn-delete, .btn-save, .btn-cancel {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          margin-right: 0.25rem;
          transition: background-color 0.2s ease;
        }

        .btn-save {
          background-color: #28a745;
          color: white;
        }

        .btn-save:hover {
          background-color: #218838;
        }

        .btn-cancel {
          background-color: #6c757d;
          color: white;
        }

        .btn-cancel:hover {
          background-color: #5a6268;
        }

        .btn-edit {
          background-color: #3498db;
          color: white;
        }

        .btn-edit:hover {
          background-color: #2980b9;
        }

        .btn-delete {
          background-color: #dc3545;
          color: white;
        }

        .btn-delete:hover {
          background-color: #c82333;
        }

        @media (max-width: 768px) {
          .doctors-table-container {
            font-size: 0.875rem;
          }
          
          .doctors-table th,
          .doctors-table td {
            padding: 0.5rem;
          }

          .name-edit {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AllRegisteredDoctors
