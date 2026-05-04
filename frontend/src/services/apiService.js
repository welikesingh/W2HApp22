// API Service for all backend calls
import { API_URLS } from '../config/api';

class ApiService {
  // Health Check
  async healthCheck() {
    const response = await fetch(API_URLS.health);
    return response.json();
  }

  // ==================== PATIENTS CRUD ====================
  
  // Get all patients
  async getPatients() {
    const response = await fetch(API_URLS.patients);
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
  }

  // Get single patient
  async getPatient(id) {
    const response = await fetch(API_URLS.patient(id));
    if (!response.ok) throw new Error('Failed to fetch patient');
    return response.json();
  }

  // Create patient
  async createPatient(patientData) {
    const response = await fetch(API_URLS.patients, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error('Failed to create patient');
    return response.json();
  }

  // Update patient
  async updatePatient(id, patientData) {
    const response = await fetch(API_URLS.patient(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error('Failed to update patient');
    return response.json();
  }

  // Delete patient
  async deletePatient(id) {
    const response = await fetch(API_URLS.patient(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete patient');
    return true;
  }

  // ==================== SCANS CRUD ====================
  
  // Get all scans
  async getScans() {
    const response = await fetch(API_URLS.scans);
    if (!response.ok) throw new Error('Failed to fetch scans');
    return response.json();
  }

  // Get scans for specific patient
  async getPatientScans(patientId) {
    const response = await fetch(`${API_URLS.scans}?patient=${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch patient scans');
    return response.json();
  }

  // Create scan report
  async createScan(scanData) {
    const response = await fetch(API_URLS.scans, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanData),
    });
    if (!response.ok) throw new Error('Failed to create scan');
    return response.json();
  }

  // Delete scan
  async deleteScan(id) {
    const response = await fetch(API_URLS.scan(id), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete scan');
    return true;
  }

  // ==================== AI ANALYSIS ====================
  
  // Analyze scan (general)
  async analyzeScan(formData) {
    const response = await fetch(API_URLS.analyze, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Analysis failed');
    return response.json();
  }

  // Get advice (general)
  async getAdvice(data) {
    const response = await fetch(API_URLS.advice, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Advice generation failed');
    return response.json();
  }

  // Analyze liver scan
  async hepatoAnalyze(formData) {
    const response = await fetch(API_URLS.hepatoAnalyze, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Liver analysis failed');
    return response.json();
  }

  // Get liver advice
  async hepatoAdvice(data) {
    const response = await fetch(API_URLS.hepatoAdvice, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Liver advice generation failed');
    return response.json();
  }
}

export default new ApiService();
