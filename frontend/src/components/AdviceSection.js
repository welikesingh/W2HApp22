import React from 'react';

const AdviceSection = ({ advice, scanType }) => {
  return (
    <div className="card">
      <div className="report-header">
        <h2>💡 Patient Advice</h2>
      </div>

      {advice.simpleSummary && (
        <div className="report-section">
          <h3>Simple Summary</h3>
          <p>{advice.simpleSummary}</p>
        </div>
      )}

      {advice.whatItMeans && (
        <div className="report-section">
          <h3>What It Means</h3>
          <p>{advice.whatItMeans}</p>
        </div>
      )}

      {advice.recommendations && advice.recommendations.length > 0 && (
        <div className="report-section">
          <h3>Recommendations</h3>
          <div className="recommendation-list">
            {advice.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="icon">✓</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice.redFlags && advice.redFlags.length > 0 && (
        <div className="report-section">
          <h3>🚨 Red Flags - Seek Immediate Care If:</h3>
          <div className="red-flags-list">
            {advice.redFlags.map((flag, index) => (
              <div key={index} className="red-flag-item">
                <span>⚠️</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice.warningSigns && advice.warningSigns.length > 0 && (
        <div className="report-section">
          <h3>⚠️ Warning Signs - Watch For:</h3>
          <div className="warning-signs-list">
            {advice.warningSigns.map((sign, index) => (
              <div key={index} className="warning-sign-item">
                <span>⚡</span>
                <span>{sign}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice.specialistReferral && (
        <div className="report-section">
          <h3>Specialist Referral</h3>
          <p><strong>{advice.specialistReferral}</strong></p>
        </div>
      )}

      {advice.disclaimer && (
        <div className="disclaimer-box">
          <p>{advice.disclaimer}</p>
        </div>
      )}
    </div>
  );
};

export default AdviceSection;
