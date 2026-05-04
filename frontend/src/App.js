import React, { useState } from 'react';
import UploadSection from './components/UploadSection';
import PatientForm from './components/PatientForm';
import ReportSection from './components/ReportSection';
import AdviceSection from './components/AdviceSection';
import './App.css';

function App() {
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
      const endpoint = scanType === 'hepato' ? '/api/hepato-analyze/' : '/api/analyze/';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
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
      const endpoint = scanType === 'hepato' ? '/api/hepato-advice/' : '/api/advice/';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: reportData,
          patientAge: patientData.age,
          patientSex: patientData.sex,
          symptoms: patientData.symptoms,
          alcoholUse: patientData.alcoholUse
        }),
      });

      if (!response.ok) {
        throw new Error('Advice generation failed');
      }

      const data = await response.json();
      setAdvice(data.advice);
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

      <main className="container">
        {error && <div className="error">{error}</div>}

        {!report ? (
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
