import React, { useState, useEffect } from 'react'

const AllMedicalLocations = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      console.log('Fetching from: /api/hospitals')
      const response = await fetch('/api/hospitals')
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        console.log('Response not OK:', response.status, response.statusText)
        setError(`Failed to fetch medical locations: ${response.status} ${response.statusText}`)
        return
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      setLocations(data)
    } catch (error) {
      console.log('Fetch error:', error)
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Medical location?')) {
      try {
        console.log(`Deleting hospital with ID: ${id}`)
        const response = await fetch(`/api/hospitals/${id}`, {
          method: 'DELETE'
        })
        console.log('Delete response status:', response.status)
        if (response.ok) {
          setLocations(locations.filter(location => location.hospitalId !== id))
        } else {
          console.log('Delete failed:', response.status, response.statusText)
          setError(`Failed to delete medical location: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log('Delete error:', error)
        setError('Error connecting to server')
      }
    }
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

  if (loading) {
    return <div className="loading">Loading medical locations...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="all-medical-locations">
      <h2>All Medical Locations</h2>
      
      {locations.length === 0 ? (
        <div className="no-locations">
          <p>No medical locations found. Add your first location above.</p>
        </div>
      ) : (
        <div className="locations-table-container">
          <table className="locations-table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Type</th>
                <th>Address</th>
                <th>City</th>
                <th>Province</th>
                <th>Telephone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.hospitalId}>
                  <td>{location.name}</td>
                  <td>
                    <span className={`type-badge ${location.type.toLowerCase()}`}>
                      {getTypeLabel(location.type)}
                    </span>
                  </td>
                  <td>{location.address}</td>
                  <td>{location.city}</td>
                  <td>{location.province}</td>
                  <td>{location.telephone}</td>
                  <td>{location.email || '-'}</td>
                  <td>
                    <span className={`status-badge ${location.isActive ? 'active' : 'inactive'}`}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit">Edit</button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(location.hospitalId)}
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
        .all-medical-locations {
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

        .no-locations {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .locations-table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .locations-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .locations-table th {
          background-color: #f8f9fa;
          color: #34495e;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e1e8ed;
        }

        .locations-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e1e8ed;
          vertical-align: middle;
        }

        .locations-table tr:hover {
          background-color: #f8f9fa;
        }

        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .type-badge.hospital {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .type-badge.clinic {
          background-color: #f3e5f5;
          color: #a855f7;
        }

        .type-badge.nursing_home {
          background-color: #e0f2fe;
          color: #0891b2;
        }

        .type-badge.diagnostic_center {
          background-color: #fef3c7;
          color: #f59e0b;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background-color: #28a745;
          color: white;
        }

        .status-badge.inactive {
          background-color: #dc3545;
          color: white;
        }

        .btn-edit, .btn-delete {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          margin-right: 0.25rem;
          transition: background-color 0.2s ease;
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
          .locations-table-container {
            font-size: 0.875rem;
          }
          
          .locations-table th,
          .locations-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AllMedicalLocations
