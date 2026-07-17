import React, { useState } from 'react';
import './ApplicantForm.css';
import certificatesData from '../data/certificates.json';
import { useFormContext } from './FormContext';

const Step7 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step7 || {};

  // Lists to store added records
  const [certifications, setCertifications] = useState(initialData.certifications || []);
  const [trainings, setTrainings] = useState(initialData.trainings || []);

  const saveStepData = () => {
    updateFormData({
      step7: {
        certifications,
        trainings
      }
    });
  };

  const handleNext = () => {
    saveStepData();
    onNext();
  };

  const handlePrev = () => {
    saveStepData();
    onPrev();
  };

  // Modal visibility states
  const [showCertModal, setShowCertModal] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false); // To be implemented fully later

  // Custom Dropdown states
  const [certSearch, setCertSearch] = useState('');
  const [isCertDropdownOpen, setIsCertDropdownOpen] = useState(false);

  // Form states
  const EMPTY_CERT_FORM = {
    certificate: '',
    issuedBy: '',
    dateIssued: '',
    rating: ''
  };

  const [certForm, setCertForm] = useState({ ...EMPTY_CERT_FORM });
  const [certErrors, setCertErrors] = useState({});

  const handleCertChange = (field, value) => {
    setCertForm(prev => ({ ...prev, [field]: value }));
    if (certErrors[field]) setCertErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveCert = () => {
    const newErrors = {};
    if (!certForm.certificate || certForm.certificate === 'SELECT') newErrors.certificate = 'Please select a certificate.';
    if (!certForm.issuedBy) newErrors.issuedBy = 'Please provide the issuing authority.';
    
    if (Object.keys(newErrors).length > 0) {
      setCertErrors(newErrors);
      return;
    }

    setCertifications(prev => [...prev, certForm]);
    setCertForm({ ...EMPTY_CERT_FORM });
    setShowCertModal(false);
  };

  const removeCert = (index) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const EMPTY_TRAIN_FORM = {
    trainingName: '',
    dateFrom: '',
    dateTo: '',
    conductedBy: '',
    certReceived: '',
    completed: ''
  };
  const [trainForm, setTrainForm] = useState({ ...EMPTY_TRAIN_FORM });
  const [trainErrors, setTrainErrors] = useState({});

  const handleTrainChange = (field, value) => {
    setTrainForm(prev => ({ ...prev, [field]: value }));
    if (trainErrors[field]) setTrainErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveTrain = () => {
    const newErrors = {};
    if (!trainForm.trainingName) newErrors.trainingName = 'Please provide the training name.';
    if (!trainForm.dateFrom) newErrors.dateFrom = 'Date from is required.';
    if (!trainForm.dateTo) newErrors.dateTo = 'Date to is required.';
    if (!trainForm.conductedBy) newErrors.conductedBy = 'Please specify who conducted it.';
    
    if (Object.keys(newErrors).length > 0) {
      setTrainErrors(newErrors);
      return;
    }

    setTrainings(prev => [...prev, trainForm]);
    setTrainForm({ ...EMPTY_TRAIN_FORM });
    setShowTrainModal(false);
  };

  const removeTrain = (index) => {
    setTrainings(prev => prev.filter((_, i) => i !== index));
  };

  const certOptions = certificatesData;
  const certSearchTerms = certSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredCerts = certOptions.filter(c => {
    const fullText = c.toLowerCase();
    return certSearchTerms.every(term => fullText.includes(term));
  });

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>CERTIFICATION AND OTHER TECHNICAL/VOCATIONAL TRAINING</h2>
          <span className="step-indicator">Step 7 of 11</span>
        </div>

        <div className="form-body">
          {/* CERTIFICATION SECTION */}
          <div className="section-block">
            <h3 className="section-title">CERTIFICATION</h3>
            
            {certifications.length > 0 && (
              <div className="records-table-container">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Certificate</th>
                      <th>Issued by</th>
                      <th>Date issued</th>
                      <th>Rating</th>
                      <th style={{ width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.map((cert, idx) => (
                      <tr key={idx}>
                        <td>{cert.certificate}</td>
                        <td>{cert.issuedBy}</td>
                        <td>{cert.dateIssued}</td>
                        <td>{cert.rating}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="icon-btn delete-btn" 
                            title="Remove"
                            onClick={() => removeCert(idx)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button 
              className="add-record-btn"
              onClick={() => setShowCertModal(true)}
            >
              <span className="plus-icon">+</span> Add certification
            </button>
          </div>

          <hr className="section-divider" />

          {/* TECHNICAL/VOCATIONAL TRAINING SECTION */}
          <div className="section-block" style={{ marginTop: '20px' }}>
            <h3 className="section-title">TECHNICAL/VOCATIONAL TRAINING</h3>
            
            {trainings.length > 0 && (
              <div className="records-table-container">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Training name</th>
                      <th>Date conducted</th>
                      <th>Conducted by</th>
                      <th>Cert. received</th>
                      <th>Completed</th>
                      <th style={{ width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.map((train, idx) => (
                      <tr key={idx}>
                        <td>{train.trainingName}</td>
                        <td>{train.dateFrom} to {train.dateTo}</td>
                        <td>{train.conductedBy}</td>
                        <td>{train.certReceived}</td>
                        <td>{train.completed}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="icon-btn delete-btn" 
                            title="Remove"
                            onClick={() => removeTrain(idx)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button 
              className="add-record-btn"
              onClick={() => setShowTrainModal(true)}
            >
              <span className="plus-icon">+</span> Add training
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {/* MODALS */}
      {showCertModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Add new record</h3>
              <button className="close-btn" onClick={() => setShowCertModal(false)}>×</button>
            </div>
            <div className="modal-body form-modal-body">
              {/* Certificate */}
              <div className="edu-form-row">
                <label className="edu-form-label">Certificate</label>
                <div className="edu-form-control">
                  <div style={{ position: 'relative' }}>
                    <div 
                      className={`select-field ${certErrors.certificate ? 'error-border' : ''}`}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '34px', padding: '6px 12px', width: '100%' }}
                      onClick={() => setIsCertDropdownOpen(!isCertDropdownOpen)}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', paddingRight: '15px' }}>
                        {certForm.certificate || 'SELECT'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666' }}>▼</span>
                    </div>
                    
                    {isCertDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, width: 'max-content', minWidth: '100%', background: '#fff', border: '1px solid #ccc', zIndex: 1000, maxHeight: '450px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Search certificates..." 
                            value={certSearch}
                            onChange={e => setCertSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto' }}>
                          <li 
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                            className={!certForm.certificate || certForm.certificate === 'SELECT' ? 'selected-item' : ''}
                            onClick={() => { handleCertChange('certificate', 'SELECT'); setIsCertDropdownOpen(false); setCertSearch(''); }}
                            onMouseEnter={(e) => { if (certForm.certificate && certForm.certificate !== 'SELECT') e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={(e) => { if (certForm.certificate && certForm.certificate !== 'SELECT') e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span>SELECT</span>
                            {(!certForm.certificate || certForm.certificate === 'SELECT') && <span>✔</span>}
                          </li>
                          {filteredCerts.map(opt => (
                            <li 
                              key={opt}
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                              className={certForm.certificate === opt ? 'selected-item' : ''}
                              onClick={() => { handleCertChange('certificate', opt); setIsCertDropdownOpen(false); setCertSearch(''); }}
                              onMouseEnter={(e) => { if (certForm.certificate !== opt) e.currentTarget.style.background = '#f5f5f5'; }}
                              onMouseLeave={(e) => { if (certForm.certificate !== opt) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span>{opt}</span>
                              {certForm.certificate === opt && <span>✔</span>}
                            </li>
                          ))}
                          {filteredCerts.length === 0 && (
                            <li style={{ padding: '8px 12px', color: '#999', fontSize: '0.9rem' }}>No matches found</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {certErrors.certificate && <span className="error-text">{certErrors.certificate}</span>}
                </div>
              </div>

              {/* Issued by */}
              <div className="edu-form-row">
                <label className="edu-form-label">Issued by</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className={`input-field ${certErrors.issuedBy ? 'error-border' : ''}`}
                    value={certForm.issuedBy}
                    onChange={(e) => handleCertChange('issuedBy', e.target.value)}
                  />
                  {certErrors.issuedBy && <span className="error-text">{certErrors.issuedBy}</span>}
                </div>
              </div>

              {/* Date issued */}
              <div className="edu-form-row">
                <label className="edu-form-label">Date issued</label>
                <div className="edu-form-control">
                  <div className="input-with-button short-input-wrapper" style={{ width: '180px' }}>
                    <input 
                      type="date" 
                      className="input-field"
                      value={certForm.dateIssued}
                      onChange={(e) => handleCertChange('dateIssued', e.target.value)}
                      style={{ borderRight: 'none', borderRadius: '4px 0 0 4px' }}
                    />
                    <button type="button" className="icon-btn search-btn" style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '0 4px 4px 0', borderLeft: 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="edu-form-row">
                <label className="edu-form-label">Rating</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className="input-field"
                    value={certForm.rating}
                    onChange={(e) => handleCertChange('rating', e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions-centered">
                <button className="btn-save" onClick={handleSaveCert}>Save</button>
                <button className="btn-cancel" onClick={() => setShowCertModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrainModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Add new record</h3>
              <button className="close-btn" onClick={() => setShowTrainModal(false)}>×</button>
            </div>
            <div className="modal-body form-modal-body">
              {/* Training name */}
              <div className="edu-form-row">
                <label className="edu-form-label">Training name</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className={`input-field ${trainErrors.trainingName ? 'error-border' : ''}`}
                    value={trainForm.trainingName}
                    onChange={(e) => handleTrainChange('trainingName', e.target.value)}
                  />
                  {trainErrors.trainingName && <span className="error-text">{trainErrors.trainingName}</span>}
                </div>
              </div>

              {/* Date conducted */}
              <div className="edu-form-row">
                <label className="edu-form-label">Date conducted</label>
                <div className="edu-form-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="date" 
                      className={`input-field ${trainErrors.dateFrom ? 'error-border' : ''}`}
                      value={trainForm.dateFrom}
                      onChange={(e) => handleTrainChange('dateFrom', e.target.value)}
                      style={{ width: '140px', color: '#666' }}
                    />
                    <span style={{ padding: '0 8px', color: '#666', fontSize: '13px', fontWeight: '500' }}>to</span>
                    <input 
                      type="date" 
                      className={`input-field ${trainErrors.dateTo ? 'error-border' : ''}`}
                      value={trainForm.dateTo}
                      onChange={(e) => handleTrainChange('dateTo', e.target.value)}
                      style={{ width: '140px', color: '#666' }}
                    />
                  </div>
                </div>
              </div>
              {(trainErrors.dateFrom || trainErrors.dateTo) && (
                <div className="error-text" style={{ marginLeft: '148px', marginTop: '-10px', marginBottom: '10px' }}>Please provide both dates.</div>
              )}

              {/* Conducted by */}
              <div className="edu-form-row">
                <label className="edu-form-label">Conducted by</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className={`input-field ${trainErrors.conductedBy ? 'error-border' : ''}`}
                    value={trainForm.conductedBy}
                    onChange={(e) => handleTrainChange('conductedBy', e.target.value)}
                  />
                  {trainErrors.conductedBy && <span className="error-text">{trainErrors.conductedBy}</span>}
                </div>
              </div>

              {/* Cert. received */}
              <div className="edu-form-row">
                <label className="edu-form-label">Cert. received</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className="input-field"
                    value={trainForm.certReceived}
                    onChange={(e) => handleTrainChange('certReceived', e.target.value)}
                  />
                </div>
              </div>

              {/* Completed */}
              <div className="edu-form-row">
                <label className="edu-form-label">Completed</label>
                <div className="edu-form-control" style={{ flexDirection: 'row', gap: '15px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#333' }}>
                    <input 
                      type="radio" 
                      name="trainCompleted" 
                      value="Yes"
                      checked={trainForm.completed === 'Yes'}
                      onChange={(e) => handleTrainChange('completed', e.target.value)}
                    />
                    Yes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#333' }}>
                    <input 
                      type="radio" 
                      name="trainCompleted" 
                      value="No"
                      checked={trainForm.completed === 'No'}
                      onChange={(e) => handleTrainChange('completed', e.target.value)}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions-centered">
                <button className="btn-save" onClick={handleSaveTrain}>Save</button>
                <button className="btn-cancel" onClick={() => setShowTrainModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7;
