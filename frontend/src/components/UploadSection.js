import React, { useRef } from 'react';

const UploadSection = ({ file, setFile, onAnalyze, loading }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="card">
      <h2>Upload Scan</h2>
      <div
        className={`upload-area ${file ? 'has-file' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {!file ? (
          <div className="upload-text">
            <div className="upload-icon">📁</div>
            <h3>Click or drag scan image here</h3>
            <p>Supports: JPG, PNG, GIF, BMP (Max 20MB)</p>
          </div>
        ) : (
          <div className="file-preview">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Scan preview" 
            />
            <div>
              <p>{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary analyze-btn"
        onClick={onAnalyze}
        disabled={loading || !file}
      >
        {loading ? (
          <>
            <span className="loading" style={{ marginRight: '10px' }}></span>
            Analyzing...
          </>
        ) : (
          '🔍 Analyze Scan'
        )}
      </button>
    </div>
  );
};

export default UploadSection;
