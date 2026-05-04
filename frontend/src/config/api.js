// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://w2happ22-1.onrender.com';

export const API_URLS = {
  base: API_BASE_URL,
  health: `${API_BASE_URL}/api/health/`,
  patients: `${API_BASE_URL}/api/patients/`,
  patient: (id) => `${API_BASE_URL}/api/patients/${id}/`,
  scans: `${API_BASE_URL}/api/scans/`,
  scan: (id) => `${API_BASE_URL}/api/scans/${id}/`,
  analyze: `${API_BASE_URL}/api/analyze/`,
  advice: `${API_BASE_URL}/api/advice/`,
  hepatoAnalyze: `${API_BASE_URL}/api/hepato-analyze/`,
  hepatoAdvice: `${API_BASE_URL}/api/hepato-advice/`,
  admin: `${API_BASE_URL}/admin/`,
};

export default API_URLS;
