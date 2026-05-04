import React from 'react';

const PatientForm = ({ patientData, setPatientData, showAlcohol }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card">
      <h2>Patient Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="input"
            value={patientData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="input"
            value={patientData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="input"
            value={patientData.email}
            onChange={handleChange}
            placeholder="patient@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="input"
            value={patientData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            className="input"
            value={patientData.age}
            onChange={handleChange}
            placeholder="Enter age"
            min="0"
            max="150"
          />
        </div>

        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <select
            id="sex"
            name="sex"
            className="select"
            value={patientData.sex}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {showAlcohol && (
          <div className="form-group">
            <label htmlFor="alcoholUse">Alcohol Use</label>
            <select
              id="alcoholUse"
              name="alcoholUse"
              className="select"
              value={patientData.alcoholUse}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        )}

        <div className="form-group full-width">
          <label htmlFor="symptoms">Symptoms / Notes</label>
          <textarea
            id="symptoms"
            name="symptoms"
            className="textarea"
            value={patientData.symptoms}
            onChange={handleChange}
            placeholder="Describe any symptoms, medical history, or additional notes..."
            rows="4"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
