import React, { useState } from 'react';
import './ApplicantForm.css';
import occupationsData from '../data/occupations.json';
import { useFormContext } from './FormContext';

const Step9 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step9 || {};

  const [workExperiences, setWorkExperiences] = useState(initialData.workExperiences || []);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [isManualPosition, setIsManualPosition] = useState(false);

  const saveStepData = () => {
    updateFormData({
      step9: {
        workExperiences
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

  // Occupation modal states
  const [showOccModal, setShowOccModal] = useState(false);
  const [occSearchTerm, setOccSearchTerm] = useState('');
  const [occPage, setOccPage] = useState(1);
  const [occPageWindowStart, setOccPageWindowStart] = useState(1);
  const OCC_PER_PAGE = 10;
  const WINDOW_SIZE = 10;

  const EMPTY_WORK_FORM = {
    employerName: '',
    address: '',
    positionHeld: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  };

  const [workForm, setWorkForm] = useState({ ...EMPTY_WORK_FORM });
  const [workErrors, setWorkErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const handleWorkChange = (field, value) => {
    setWorkForm(prev => ({ ...prev, [field]: value }));
    if (workErrors[field]) setWorkErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveWork = () => {
    const newErrors = {};
    if (!workForm.employerName) newErrors.employerName = 'Please enter employer name.';
    if (!workForm.address) newErrors.address = 'Please enter address.';
    if (!workForm.positionHeld) newErrors.positionHeld = 'Please enter position held.';
    if (!workForm.dateFrom) newErrors.dateFrom = 'Date from is required.';
    if (!workForm.dateTo) newErrors.dateTo = 'Date to is required.';
    if (!workForm.status || workForm.status === 'SELECT') newErrors.status = 'Please select a status.';
    
    if (Object.keys(newErrors).length > 0) {
      setWorkErrors(newErrors);
      return;
    }

    if (editIndex !== null) {
      setWorkExperiences(prev => {
        const copy = [...prev];
        copy[editIndex] = workForm;
        return copy;
      });
      setEditIndex(null);
    } else {
      setWorkExperiences(prev => [...prev, workForm]);
    }
    
    setWorkForm({ ...EMPTY_WORK_FORM });
    setShowWorkModal(false);
  };

  const editWork = (idx) => {
    setWorkForm(workExperiences[idx]);
    setEditIndex(idx);
    setIsManualPosition(true); // Allow easy editing
    setShowWorkModal(true);
  };

  const removeWork = (index) => {
    setWorkExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  };

  const statusOptions = [
    "Permanent",
    "Contractual",
    "Probationary",
    "Part-time"
  ];

  const searchTerms = occSearchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredOccs = occupationsData.filter(occ => {
    const fullText = `${occ.occupation.toLowerCase()} ${occ.code}`;
    return searchTerms.every(term => fullText.includes(term));
  }).sort((a, b) => a.occupation.localeCompare(b.occupation));
  const totalOccPages = Math.ceil(filteredOccs.length / OCC_PER_PAGE);
  const currentOccs = filteredOccs.slice((occPage - 1) * OCC_PER_PAGE, occPage * OCC_PER_PAGE);

  const windowEnd = Math.min(occPageWindowStart + WINDOW_SIZE - 1, totalOccPages);
  const hasMore = windowEnd < totalOccPages;

  const handleEllipsisClick = () => {
    const next = occPageWindowStart + WINDOW_SIZE;
    setOccPageWindowStart(next);
    setOccPage(next);
  };

  const handlePrevWindow = () => {
    const prev = Math.max(1, occPageWindowStart - WINDOW_SIZE);
    setOccPageWindowStart(prev);
    setOccPage(prev);
  };

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>WORK EXPERIENCE</h2>
          <span className="step-indicator">Step 9 of 11</span>
        </div>

        <div className="form-body">
          <div className="section-block">
            {workExperiences.length > 0 && (
              <div className="table-container" style={{ marginBottom: '15px' }}>
                <table className="search-results-table">
                  <thead>
                    <tr>
                      <th style={{ color: '#555', textAlign: 'center' }}>Employer</th>
                      <th style={{ color: '#555', textAlign: 'center' }}>Address</th>
                      <th style={{ color: '#555', textAlign: 'center' }}>Position</th>
                      <th style={{ color: '#555', width: '80px', textAlign: 'center' }}>From</th>
                      <th style={{ color: '#555', width: '80px', textAlign: 'center' }}>To</th>
                      <th style={{ color: '#555', width: '110px', textAlign: 'center' }}>Status</th>
                      <th style={{ color: '#555', width: '50px', textAlign: 'center' }}>Edit</th>
                      <th style={{ color: '#555', width: '50px', textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workExperiences.map((work, idx) => (
                      <tr key={idx} style={{ textTransform: 'uppercase', backgroundColor: '#fff', cursor: 'default' }}>
                        <td style={{ textAlign: 'left' }}>{work.employerName}</td>
                        <td style={{ textAlign: 'left' }}>{work.address}</td>
                        <td style={{ textAlign: 'left' }}>{work.positionHeld}</td>
                        <td style={{ textAlign: 'center' }}>{formatDate(work.dateFrom)}</td>
                        <td style={{ textAlign: 'center' }}>{formatDate(work.dateTo)}</td>
                        <td style={{ textAlign: 'center' }}>{work.status}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="icon-btn edit-btn" 
                            title="Edit"
                            onClick={() => editWork(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="icon-btn delete-btn" 
                            title="Delete"
                            onClick={() => removeWork(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
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
              className="add-btn"
              onClick={() => {
                setWorkForm({ ...EMPTY_WORK_FORM });
                setIsManualPosition(false);
                setShowWorkModal(true);
              }}
            >
              <strong>+</strong> Add work experience
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {/* MODAL */}
      {showWorkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Add new record</h3>
              <button className="close-btn" onClick={() => setShowWorkModal(false)}>×</button>
            </div>
            <div className="modal-body form-modal-body">
              
              {/* Employer Name */}
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '110px', minWidth: '110px' }}>Employer name</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className={`input-field ${workErrors.employerName ? 'error-border' : ''}`}
                    value={workForm.employerName}
                    onChange={(e) => handleWorkChange('employerName', e.target.value)}
                  />
                  {workErrors.employerName && <span className="error-text">{workErrors.employerName}</span>}
                </div>
              </div>

              {/* Address */}
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '110px', minWidth: '110px' }}>Address</label>
                <div className="edu-form-control">
                  <input 
                    type="text" 
                    className={`input-field ${workErrors.address ? 'error-border' : ''}`}
                    value={workForm.address}
                    onChange={(e) => handleWorkChange('address', e.target.value)}
                  />
                  {workErrors.address && <span className="error-text">{workErrors.address}</span>}
                </div>
              </div>

              {/* Position held */}
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '110px', minWidth: '110px' }}>Position held</label>
                <div className="edu-form-control">
                  <div className="input-with-button" style={{ display: 'flex' }}>
                    <input 
                      type="text" 
                      className={`input-field ${workErrors.positionHeld ? 'error-border' : ''}`}
                      value={workForm.positionHeld}
                      onChange={(e) => handleWorkChange('positionHeld', e.target.value)}
                      onClick={() => !isManualPosition && setShowOccModal(true)}
                      readOnly={!isManualPosition}
                      style={{ 
                        borderRight: isManualPosition ? '1px solid #ddd' : 'none', 
                        borderRadius: isManualPosition ? '4px' : '4px 0 0 4px', 
                        flex: 1, 
                        cursor: isManualPosition ? 'text' : 'pointer', 
                        backgroundColor: '#fff' 
                      }}
                    />
                    {!isManualPosition && (
                      <button type="button" className="icon-btn search-btn" onClick={() => setShowOccModal(true)} style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '0 4px 4px 0', borderLeft: 'none', width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="manual-occ-work" 
                      checked={isManualPosition}
                      onChange={(e) => setIsManualPosition(e.target.checked)}
                      style={{ marginRight: '6px', cursor: 'pointer' }}
                    />
                    <label htmlFor="manual-occ-work" style={{ color: '#337ab7', fontSize: '0.9rem', cursor: 'pointer' }}>
                      Not in the list? Enter occupation manually
                    </label>
                  </div>
                  {workErrors.positionHeld && <span className="error-text">{workErrors.positionHeld}</span>}
                </div>
              </div>

              {/* Inclusive dates */}
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '110px', minWidth: '110px' }}>Inclusive dates</label>
                <div className="edu-form-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="date" 
                      className={`input-field ${workErrors.dateFrom ? 'error-border' : ''}`}
                      value={workForm.dateFrom}
                      onChange={(e) => handleWorkChange('dateFrom', e.target.value)}
                      style={{ width: '140px', color: '#666' }}
                    />
                    <span style={{ padding: '0 8px', color: '#666', fontSize: '13px', fontWeight: '500' }}>to</span>
                    <input 
                      type="date" 
                      className={`input-field ${workErrors.dateTo ? 'error-border' : ''}`}
                      value={workForm.dateTo}
                      onChange={(e) => handleWorkChange('dateTo', e.target.value)}
                      style={{ width: '140px', color: '#666' }}
                    />
                  </div>
                </div>
              </div>
              {(workErrors.dateFrom || workErrors.dateTo) && (
                <div className="error-text" style={{ marginLeft: '148px', marginTop: '-10px', marginBottom: '10px' }}>Please provide both dates.</div>
              )}

              {/* Status */}
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '110px', minWidth: '110px' }}>Status</label>
                <div className="edu-form-control">
                  <select 
                    className={`select-field ${workErrors.status ? 'error-border' : ''}`}
                    value={workForm.status}
                    onChange={(e) => handleWorkChange('status', e.target.value)}
                  >
                    <option value="SELECT">SELECT</option>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {workErrors.status && <span className="error-text">{workErrors.status}</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '20px', marginLeft: '128px' }}>
                <button onClick={handleSaveWork} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ccc', borderRadius: '2px', cursor: 'pointer', color: '#333' }}>Save</button>
                <button onClick={() => setShowWorkModal(false)} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ccc', borderRadius: '2px', cursor: 'pointer', color: '#333' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OCCUPATION MODAL */}
      {showOccModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header" style={{ background: '#337ab7', color: 'white', padding: '10px 15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'normal' }}>Select occupation</h3>
              <button className="close-btn" style={{ color: 'white', opacity: 0.8 }} onClick={() => setShowOccModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '15px' }}>
              
              <div style={{ display: 'flex', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search term" 
                  value={occSearchTerm}
                  onChange={(e) => { setOccSearchTerm(e.target.value); setOccPage(1); setOccPageWindowStart(1); }}
                  style={{ flex: 1, borderRadius: '3px 0 0 3px' }}
                />
                <button 
                  style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ccc', borderLeft: 'none', borderRadius: '0 3px 3px 0', cursor: 'pointer', color: '#333' }}
                >
                  Search
                </button>
              </div>

              <div style={{ border: '1px solid #ddd', borderRadius: '3px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '8px', color: '#337ab7', fontSize: '0.85rem', width: '20%', textAlign: 'center' }}>Code</th>
                      <th style={{ padding: '8px', color: '#337ab7', fontSize: '0.85rem', textAlign: 'left' }}>Occupation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOccs.map((occ, idx) => (
                      <tr 
                        key={idx} 
                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                          handleWorkChange('positionHeld', occ.occupation);
                          setShowOccModal(false);
                        }}
                      >
                        <td style={{ padding: '8px', color: '#337ab7', fontSize: '0.85rem', textAlign: 'center' }}>{occ.code}</td>
                        <td style={{ padding: '8px', color: '#337ab7', fontSize: '0.85rem' }}>{occ.occupation}</td>
                      </tr>
                    ))}
                    {currentOccs.length === 0 && (
                      <tr>
                        <td colSpan="2" style={{ padding: '15px', textAlign: 'center', color: '#777' }}>No occupations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalOccPages > 1 && (
                <div style={{ display: 'flex', marginTop: '10px', border: '1px solid #ddd', borderRadius: '3px', width: 'fit-content' }}>
                  {occPageWindowStart > 1 && (
                    <button
                      onClick={handlePrevWindow}
                      title="Previous 10 pages"
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: '#337ab7',
                        border: 'none',
                        borderRight: '1px solid #ddd',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      ...
                    </button>
                  )}
                  {Array.from({ length: windowEnd - occPageWindowStart + 1 }, (_, i) => occPageWindowStart + i).map(p => (
                    <button
                      key={p}
                      onClick={() => setOccPage(p)}
                      style={{
                        padding: '6px 12px',
                        background: occPage === p ? '#337ab7' : 'transparent',
                        color: occPage === p ? 'white' : '#337ab7',
                        border: 'none',
                        borderRight: '1px solid #ddd',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  {hasMore && (
                    <button
                      onClick={handleEllipsisClick}
                      title="Next 10 pages"
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: '#337ab7',
                        border: 'none',
                        borderRight: '1px solid #ddd',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      ...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step9;
