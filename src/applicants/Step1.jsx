import React, { useState, useRef } from 'react';
import './ApplicantForm.css';
import { useFormContext } from './FormContext';

const Step1 = ({ onNext }) => {
  const { formData, updateFormData } = useFormContext();
  // Keep file preview state locally to avoid storing URLs in global state
  const [file, setFile] = useState(formData.resumeFile || null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFileError('Only PDF files are allowed.');
        setFile(null);
        setFileUrl(null);
        return;
      }
      setFileError('');
      setFile(selectedFile);
      updateFormData({ resumeFile: selectedFile });
      // Create a local URL so the user can preview/download it
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
    }
  };

  const handleDobChange = (field, value) => {
    const parts = (formData.dob || '--').split('-');
    let y = parts[0] !== '' && parts[0] !== undefined ? parts[0] : '';
    let m = parts[1] !== '' && parts[1] !== undefined ? parts[1] : '';
    let d = parts[2] !== '' && parts[2] !== undefined ? parts[2] : '';
    
    if (field === 'year') y = value;
    if (field === 'month') m = value;
    if (field === 'day') d = value;

    updateFormData({ dob: `${y}-${m}-${d}` });
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handlePrint = () => {
    if (fileUrl) {
      // Create a temporary link element to trigger the download/print action
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="applicant-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>APPLICANT NAME</h2>
          <span className="step-indicator">Step 1 of 11</span>
        </div>

        <div className="form-body">
          <div className="form-row">
            <label>Last name</label>
            <input 
              type="text" 
              className="input-field" 
              autoFocus 
              value={formData.lastName || ''} 
              onChange={e => updateFormData({ lastName: e.target.value })} 
            />
          </div>

          <div className="form-row">
            <label>First name</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.firstName || ''} 
              onChange={e => updateFormData({ firstName: e.target.value })} 
            />
          </div>

          <div className="form-row">
            <label>Middle name</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                className="input-field" 
                value={formData.middleName || ''} 
                onChange={e => updateFormData({ middleName: e.target.value })} 
              />
              <span className="subtext">Put hyphen (-) if not applicable</span>
            </div>
          </div>

          <div className="form-row">
            <label>Suffix</label>
            <select 
              className="select-field" 
              value={formData.suffix || 'NONE'} 
              onChange={e => updateFormData({ suffix: e.target.value })}
            >
              <option value="NONE">NONE</option>
              <option value="SR">SR</option>
              <option value="JR">JR</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
            </select>
          </div>

          <div className="form-row">
            <label>Date of birth</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                className="select-field" 
                style={{ flex: 1, width: 'auto' }}
                value={(formData.dob || '--').split('-')[1] || ''} 
                onChange={e => handleDobChange('month', e.target.value)}
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                  <option key={m} value={m}>{new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'short' })}</option>
                ))}
              </select>

              <select 
                className="select-field" 
                style={{ flex: 1, width: 'auto' }}
                value={(formData.dob || '--').split('-')[2] || ''} 
                onChange={e => handleDobChange('day', e.target.value)}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select 
                className="select-field" 
                style={{ flex: 1, width: 'auto' }}
                value={(formData.dob || '--').split('-')[0] || ''} 
                onChange={e => handleDobChange('year', e.target.value)}
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Sex</label>
            <select 
              className="select-field" 
              value={formData.sex || ''} 
              onChange={e => updateFormData({ sex: e.target.value })}
              style={{ 
                appearance: 'auto',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">SELECT</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          <div className="form-row resume-row">
            <label>Resume</label>
            <div className="resume-upload-container">
              <div className={`resume-box ${file ? 'has-file' : ''}`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={file ? "#2ecc71" : "#ccc"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s ease' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="box-text" style={{ textAlign: 'center', padding: '0 8px', wordBreak: 'break-word', fontSize: file ? '0.8rem' : 'inherit', color: file ? '#2ecc71' : '#aaa', fontWeight: file ? 'bold' : 'normal', transition: 'color 0.3s ease' }}>
                  {file ? file.name : 'PDF ONLY'}
                </span>
              </div>
              <div className="upload-actions">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept=".pdf,application/pdf"
                />
                <div className="file-info">
                  <button className="choose-btn" onClick={handleUploadClick}>Choose File</button>
                  <span className="file-name">{file ? file.name : "No file chosen"}</span>
                </div>
                {fileError && <span className="error-text" style={{ display: 'block', marginBottom: '8px', color: '#e74c3c', fontSize: '0.85rem' }}>{fileError}</span>}
                <button className="upload-btn" onClick={handleUploadClick}>Upload resume</button>
                {file && (
                  <button className="print-btn" onClick={handlePrint}>Download / Print Resume</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" disabled>Previous</button>
        <button className="nav-btn next-btn" onClick={onNext}>Save &amp; Continue</button>
      </div>
    </div>
  );
};

export default Step1;
