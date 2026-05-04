import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    alcohol_use: '',
    symptoms: '',
    medical_history: '',
    address: ''
  });

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPatients();
      setPatients(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      age: '',
      sex: '',
      alcohol_use: '',
      symptoms: '',
      medical_history: '',
      address: ''
    });
    setEditingPatient(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const patientPayload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

      if (editingPatient) {
        await apiService.updatePatient(editingPatient.id, patientPayload);
      } else {
        await apiService.createPatient(patientPayload);
      }
      
      await fetchPatients();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      age: patient.age || '',
      sex: patient.sex || '',
      alcohol_use: patient.alcohol_use || '',
      symptoms: patient.symptoms || '',
      medical_history: patient.medical_history || '',
      address: patient.address || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    setLoading(true);
    try {
      await apiService.deletePatient(id);
      await fetchPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return 'severity-mild';
      case 'moderate': return 'severity-moderate';
      case 'severe': return 'severity-severe';
      default: return 'severity-normal';
    }
  };

  return (
    <div className="card patient-management">
      <div className="patient-header">
        <h2>👥 Patient Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Patient'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="patient-form">
          <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                className="input"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                className="input"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                className="input"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                max="150"
              />
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select
                name="sex"
                className="select"
                value={formData.sex}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alcohol Use</label>
              <select
                name="alcohol_use"
                className="select"
                value={formData.alcohol_use}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                className="input"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group full-width">
              <label>Medical History</label>
              <textarea
                name="medical_history"
                className="textarea"
                value={formData.medical_history}
                onChange={handleInputChange}
                rows="2"
              />
            </div>
            <div className="form-group full-width">
              <label>Current Symptoms</label>
              <textarea
                name="symptoms"
                className="textarea"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows="2"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editingPatient ? 'Update Patient' : 'Create Patient')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="patients-list">
        {loading && <div className="loading"></div>}
        
        {!loading && patients.length === 0 && (
          <div className="empty-state">
            <p>No patients found. Add your first patient above.</p>
          </div>
        )}

        {patients.map(patient => (
          <div key={patient.id} className="patient-card">
            <div className="patient-info">
              <h4>{patient.first_name} {patient.last_name}</h4>
              <div className="patient-meta">
                {patient.age && <span>Age: {patient.age}</span>}
                {patient.sex && <span>Sex: {patient.sex}</span>}
                {patient.email && <span>📧 {patient.email}</span>}
                {patient.phone && <span>📞 {patient.phone}</span>}
              </div>
              {patient.alcohol_use && (
                <span className={`alcohol-badge ${patient.alcohol_use}`}>
                  Alcohol: {patient.alcohol_use}
                </span>
              )}
              {patient.symptoms && (
                <p className="patient-symptoms">Symptoms: {patient.symptoms}</p>
              )}
            </div>
            <div className="patient-actions">
              <button 
                className="btn btn-small btn-edit"
                onClick={() => handleEdit(patient)}
              >
                Edit
              </button>
              <button 
                className="btn btn-small btn-delete"
                onClick={() => handleDelete(patient.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientManagement;
