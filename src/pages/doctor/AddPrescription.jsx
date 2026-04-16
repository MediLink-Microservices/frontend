import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPrescription = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    diagnosis: '',
    medicines: '',
    dosageInstructions: '',
    duration: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8083/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Prescription added successfully!');
        navigate('/doctor/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add prescription');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Prescription</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Doctor ID *
                </label>
                <input
                  type="text"
                  id="doctorId"
                  name="doctorId"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.doctorId}
                  onChange={handleChange}
                  placeholder="Enter doctor ID"
                />
              </div>

              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient ID *
                </label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="Enter patient ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                Diagnosis *
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                required
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis details"
              />
            </div>

            <div>
              <label htmlFor="medicines" className="block text-sm font-medium text-gray-700">
                Medicines *
              </label>
              <textarea
                id="medicines"
                name="medicines"
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.medicines}
                onChange={handleChange}
                placeholder="Enter prescribed medicines (one per line or comma separated)"
              />
            </div>

            <div>
              <label htmlFor="dosageInstructions" className="block text-sm font-medium text-gray-700">
                Dosage Instructions *
              </label>
              <textarea
                id="dosageInstructions"
                name="dosageInstructions"
                required
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.dosageInstructions}
                onChange={handleChange}
                placeholder="Enter dosage instructions (e.g., Take 2 tablets twice daily after meals)"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 7 days, 2 weeks, 1 month"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional instructions or notes for the patient"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding Prescription...' : 'Add Prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPrescription;
