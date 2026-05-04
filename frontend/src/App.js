import React, { useState } from 'react';
import UploadSection from './components/UploadSection';
import PatientForm from './components/PatientForm';
import ReportSection from './components/ReportSection';
import AdviceSection from './components/AdviceSection';
import PatientManagement from './components/PatientManagement';
import apiService from './services/apiService';
import { API_URLS } from './config/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'patients'
  const [scanType, setScanType] = useState('hepato');
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    alcoholUse: '',
    symptoms: ''
  });
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a scan image');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('testType', 'ultrasound');
    formData.append('patientAge', patientData.age || 'Unknown');
    formData.append('patientSex', patientData.sex || 'Unknown');
    formData.append('symptoms', patientData.symptoms || 'None');
    formData.append('alcoholUse', patientData.alcoholUse || 'Unknown');

    try {
      const data = scanType === 'hepato' 
        ? await apiService.hepatoAnalyze(formData)
        : await apiService.analyzeScan(formData);
      
      setReport(data.report);
      
      // Automatically get advice
      await getAdvice(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAdvice = async (reportData) => {
    try {
      const adviceData = scanType === 'hepato'
        ? await apiService.hepatoAdvice({
            report: reportData,
            patientAge: patientData.age,
            patientSex: patientData.sex,
            symptoms: patientData.symptoms,
            alcoholUse: patientData.alcoholUse
          })
        : await apiService.getAdvice({
            report: reportData,
            patientAge: patientData.age,
            patientSex: patientData.sex,
            symptoms: patientData.symptoms
          });
      
      setAdvice(adviceData.advice);
    } catch (err) {
      console.error('Advice error:', err);
    }
  };

  const resetAnalysis = () => {
    setReport(null);
    setAdvice(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>HepatoScan AI</h1>
          <p>Advanced Liver Health Analysis using Artificial Intelligence</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="container">
          <button 
            className={`nav-btn ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            🔬 Scan Analysis
          </button>
          <button 
            className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            👥 Patient Management
          </button>
          <a 
            href={API_URLS.admin}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn admin-link"
          >
            ⚙️ Django Admin
          </a>
        </div>
      </nav>

      <main className="container">
        {error && <div className="error">{error}</div>}

        {activeTab === 'patients' ? (
          <PatientManagement />
        ) : !report ? (
          <>
            <div className="card scan-type-card">
              <h2>Select Scan Type</h2>
              <div className="scan-type-buttons">
                <button
                  className={`scan-type-btn ${scanType === 'hepato' ? 'active' : ''}`}
                  onClick={() => setScanType('hepato')}
                >
                  <span className="icon">🫁</span>
                  <span>Liver Analysis</span>
                  <small>Specialized liver scan assessment</small>
                </button>
                <button
                  className={`scan-type-btn ${scanType === 'general' ? 'active' : ''}`}
                  onClick={() => setScanType('general')}
                >
                  <span className="icon">🔍</span>
                  <span>General Scan</span>
                  <small>General medical imaging analysis</small>
                </button>
              </div>
            </div>

            <PatientForm 
              patientData={patientData} 
              setPatientData={setPatientData}
              showAlcohol={scanType === 'hepato'}
            />

            <UploadSection 
              file={file} 
              setFile={setFile}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </>
        ) : (
          <>
            <ReportSection report={report} scanType={scanType} />
            {advice && <AdviceSection advice={advice} scanType={scanType} />}
            <div className="card action-card">
              <button className="btn btn-primary" onClick={resetAnalysis}>
                Analyze Another Scan
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2024 HepatoScan AI. This tool is for educational purposes only.</p>
          <p className="disclaimer">Always consult with qualified healthcare providers for medical decisions.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
