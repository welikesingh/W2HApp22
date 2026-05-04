import React from 'react';

const ReportSection = ({ report, scanType }) => {
  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'urgency-urgent';
      case 'emergency': return 'urgency-emergency';
      default: return 'urgency-routine';
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
    <div className="card">
      <div className="report-header">
        <h2>{report.reportTitle || 'Medical Imaging Report'}</h2>
        {report.urgency && (
          <span className={`urgency-badge ${getUrgencyClass(report.urgency)}`}>
            {report.urgency}
          </span>
        )}
        {report.severity && (
          <span className={`severity-badge ${getSeverityClass(report.severity)}`} style={{ marginLeft: '10px' }}>
            {report.severity}
          </span>
        )}
      </div>

      {report.scanQuality && (
        <div className="report-section">
          <h3>Scan Quality</h3>
          <p>{report.scanQuality}</p>
        </div>
      )}

      {report.findings && report.findings.length > 0 && (
        <div className="report-section">
          <h3>Findings</h3>
          <div className="findings-list">
            {report.findings.map((finding, index) => (
              <div key={index} className="finding-item">
                <h4>{finding.region || finding.parameter || `Finding ${index + 1}`}</h4>
                <p>{finding.observation}</p>
                {finding.severity && (
                  <span className={`finding-status ${getSeverityClass(finding.severity)}`}>
                    {finding.severity}
                  </span>
                )}
                {finding.status && (
                  <span className={`finding-status ${getSeverityClass(finding.status)}`}>
                    {finding.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {report.impression && (
        <div className="report-section">
          <h3>Impression</h3>
          <p>{report.impression}</p>
        </div>
      )}

      {report.differentialDiagnosis && report.differentialDiagnosis.length > 0 && (
        <div className="report-section">
          <h3>Differential Diagnosis</h3>
          <div className="diagnosis-list">
            {report.differentialDiagnosis.map((diagnosis, index) => (
              <span key={index} className="diagnosis-tag">{diagnosis}</span>
            ))}
          </div>
        </div>
      )}

      {report.possibleConditions && report.possibleConditions.length > 0 && (
        <div className="report-section">
          <h3>Possible Conditions</h3>
          <div className="diagnosis-list">
            {report.possibleConditions.map((condition, index) => (
              <span key={index} className="diagnosis-tag">{condition}</span>
            ))}
          </div>
        </div>
      )}

      {report.recommendedFollowUp && (
        <div className="report-section">
          <h3>Recommended Follow-up</h3>
          <p>{report.recommendedFollowUp}</p>
        </div>
      )}

      {report.limitations && (
        <div className="report-section">
          <h3>Limitations</h3>
          <p>{report.limitations}</p>
        </div>
      )}
    </div>
  );
};

export default ReportSection;
