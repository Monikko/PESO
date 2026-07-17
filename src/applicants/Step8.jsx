import React, { useState } from 'react';
import './ApplicantForm.css';
import licensesData from '../data/licenses.json';
import { useFormContext } from './FormContext';

const Step8 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step8 || {};

  // Lists to store added records
  const [eligibilities, setEligibilities] = useState(initialData.eligibilities || []);
  const [licenses, setLicenses] = useState(initialData.licenses || []);

  const saveStepData = () => {
    updateFormData({
      step8: {
        eligibilities,
        licenses
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
  const [showEligModal, setShowEligModal] = useState(false);
  const [showLicModal, setShowLicModal] = useState(false);

  // Searchable dropdown states
  const [eligSearch, setEligSearch] = useState('');
  const [isEligDropdownOpen, setIsEligDropdownOpen] = useState(false);
  const [licSearch, setLicSearch] = useState('');
  const [isLicDropdownOpen, setIsLicDropdownOpen] = useState(false);

  // Form states
  const EMPTY_ELIG_FORM = { eligibility: '', dateTaken: '' };
  const EMPTY_LIC_FORM = { license: '', validUntil: '' };

  const [eligForm, setEligForm] = useState({ ...EMPTY_ELIG_FORM });
  const [eligErrors, setEligErrors] = useState({});

  const [licForm, setLicForm] = useState({ ...EMPTY_LIC_FORM });
  const [licErrors, setLicErrors] = useState({});

  const handleEligChange = (field, value) => {
    setEligForm(prev => ({ ...prev, [field]: value }));
    if (eligErrors[field]) setEligErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveElig = () => {
    const newErrors = {};
    if (!eligForm.eligibility || eligForm.eligibility === 'SELECT') newErrors.eligibility = 'Please select an eligibility.';
    if (!eligForm.dateTaken) newErrors.dateTaken = 'Please provide the date taken.';

    if (Object.keys(newErrors).length > 0) {
      setEligErrors(newErrors);
      return;
    }

    setEligibilities(prev => [...prev, eligForm]);
    setEligForm({ ...EMPTY_ELIG_FORM });
    setShowEligModal(false);
  };

  const removeElig = (index) => {
    setEligibilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleLicChange = (field, value) => {
    setLicForm(prev => ({ ...prev, [field]: value }));
    if (licErrors[field]) setLicErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveLic = () => {
    const newErrors = {};
    if (!licForm.license || licForm.license === 'SELECT') newErrors.license = 'Please select a license.';
    if (!licForm.validUntil) newErrors.validUntil = 'Please provide the valid until date.';

    if (Object.keys(newErrors).length > 0) {
      setLicErrors(newErrors);
      return;
    }

    setLicenses(prev => [...prev, licForm]);
    setLicForm({ ...EMPTY_LIC_FORM });
    setShowLicModal(false);
  };

  const removeLic = (index) => {
    setLicenses(prev => prev.filter((_, i) => i !== index));
  };

  const eligibilityOptions = [
    "CAREER EXECUTIVE OFFICER ELIGIBILITY",
    "CAREER EXECUTIVE SERVICE OFFICER",
    "CAREER SERVICE EXECUTIVE ELIGIBILITY",
    "CAREER SERVICE PROFESSIONAL",
    "CAREER SERVICE SUB-PROFESSIONAL",
    "DATA ENCODER",
    "FIRE OFFICER 2",
    "FORESTRY EXTENSION SERVICE",
    "POLICE OFFICER 1",
    "R.A. 1080",
    "SOIL TECHNOLOGIST",
    "STENOGRAPHER",
    "OTHERS"
  ];

  const eligSearchTerms = eligSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredElig = eligibilityOptions.filter(e => {
    const fullText = e.toLowerCase();
    return eligSearchTerms.every(term => fullText.includes(term));
  });

  const licSearchTerms = licSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredLic = licensesData.filter(l => {
    const fullText = l.toLowerCase();
    return licSearchTerms.every(term => fullText.includes(term));
  });

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>ELIGIBILITY/LICENSE</h2>
          <span className="step-indicator">Step 8 of 11</span>
        </div>

        <div className="form-body">
          {/* ELIGIBILITY SECTION */}
          <div className="section-block">
            <h3 className="section-title">ELIGIBILITY</h3>

            {eligibilities.length > 0 && (
              <div className="records-table-container" style={{ marginBottom: '15px' }}>
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Eligibility</th>
                      <th>Date taken</th>
                      <th style={{ width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibilities.map((elig, idx) => (
                      <tr key={idx}>
                        <td>{elig.eligibility}</td>
                        <td>{elig.dateTaken}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="icon-btn delete-btn"
                            title="Remove"
                            onClick={() => removeElig(idx)}
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
              onClick={() => setShowEligModal(true)}
            >
              <span className="plus-icon">+</span> Add eligibility
            </button>
          </div>

          <hr className="section-divider" style={{ margin: '30px 0' }} />

          {/* LICENSE SECTION */}
          <div className="section-block">
            <h3 className="section-title">LICENSE</h3>

            {licenses.length > 0 && (
              <div className="records-table-container" style={{ marginBottom: '15px' }}>
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>License</th>
                      <th>Valid until</th>
                      <th style={{ width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((lic, idx) => (
                      <tr key={idx}>
                        <td>{lic.license}</td>
                        <td>{lic.validUntil}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="icon-btn delete-btn"
                            title="Remove"
                            onClick={() => removeLic(idx)}
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
              onClick={() => setShowLicModal(true)}
            >
              <span className="plus-icon">+</span> Add license
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
      {/* ELIGIBILITY MODAL */}
      {showEligModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Add new record</h3>
              <button className="close-btn" onClick={() => setShowEligModal(false)}>×</button>
            </div>
            <div className="modal-body form-modal-body">
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '100px', minWidth: '100px' }}>Eligibility</label>
                <div className="edu-form-control">
                  <div style={{ position: 'relative' }}>
                    <div
                      className={`select-field ${eligErrors.eligibility ? 'error-border' : ''}`}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '34px', padding: '6px 12px', width: '100%' }}
                      onClick={() => setIsEligDropdownOpen(!isEligDropdownOpen)}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', paddingRight: '15px' }}>
                        {eligForm.eligibility || 'SELECT'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666' }}>▼</span>
                    </div>

                    {isEligDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, width: 'max-content', minWidth: '100%', background: '#fff', border: '1px solid #ccc', zIndex: 1000, maxHeight: '450px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Search..."
                            value={eligSearch}
                            onChange={e => setEligSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto' }}>
                          <li
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                            onClick={() => { handleEligChange('eligibility', 'SELECT'); setIsEligDropdownOpen(false); setEligSearch(''); }}
                            className={eligForm.eligibility === 'SELECT' || !eligForm.eligibility ? 'selected-item' : ''}
                            onMouseEnter={(e) => { if (eligForm.eligibility !== 'SELECT' && eligForm.eligibility) e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={(e) => { if (eligForm.eligibility !== 'SELECT' && eligForm.eligibility) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span>SELECT</span>
                            {(!eligForm.eligibility || eligForm.eligibility === 'SELECT') && <span>✔</span>}
                          </li>
                          {filteredElig.map(opt => (
                            <li
                              key={opt}
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                              onClick={() => { handleEligChange('eligibility', opt); setIsEligDropdownOpen(false); setEligSearch(''); }}
                              className={eligForm.eligibility === opt ? 'selected-item' : ''}
                              onMouseEnter={(e) => { if (eligForm.eligibility !== opt) e.currentTarget.style.background = '#f5f5f5'; }}
                              onMouseLeave={(e) => { if (eligForm.eligibility !== opt) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span>{opt}</span>
                              {eligForm.eligibility === opt && <span>✔</span>}
                            </li>
                          ))}
                          {filteredElig.length === 0 && (
                            <li style={{ padding: '8px 12px', color: '#999', fontSize: '0.9rem' }}>No matches found</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {eligErrors.eligibility && <span className="error-text">{eligErrors.eligibility}</span>}
                </div>
              </div>

              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '100px', minWidth: '100px' }}>Date taken</label>
                <div className="edu-form-control">
                  <div className="input-with-button short-input-wrapper" style={{ width: '180px' }}>
                    <input
                      type="date"
                      className={`input-field ${eligErrors.dateTaken ? 'error-border' : ''}`}
                      value={eligForm.dateTaken}
                      onChange={(e) => handleEligChange('dateTaken', e.target.value)}
                      style={{ borderRight: 'none', borderRadius: '4px 0 0 4px', paddingRight: '5px' }}
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
                  {eligErrors.dateTaken && <span className="error-text">{eligErrors.dateTaken}</span>}
                </div>
              </div>

              <div className="modal-actions-centered">
                <button className="btn-save" onClick={handleSaveElig}>Save</button>
                <button className="btn-cancel" onClick={() => setShowEligModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LICENSE MODAL */}
      {showLicModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Add new record</h3>
              <button className="close-btn" onClick={() => setShowLicModal(false)}>×</button>
            </div>
            <div className="modal-body form-modal-body">
              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '100px', minWidth: '100px' }}>License</label>
                <div className="edu-form-control">
                  <div style={{ position: 'relative' }}>
                    <div
                      className={`select-field ${licErrors.license ? 'error-border' : ''}`}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '34px', padding: '6px 12px', width: '100%' }}
                      onClick={() => setIsLicDropdownOpen(!isLicDropdownOpen)}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', paddingRight: '15px' }}>
                        {licForm.license || 'SELECT'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666' }}>▼</span>
                    </div>

                    {isLicDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, width: 'max-content', minWidth: '100%', background: '#fff', border: '1px solid #ccc', zIndex: 1000, maxHeight: '450px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Search..."
                            value={licSearch}
                            onChange={e => setLicSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto' }}>
                          <li
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                            onClick={() => { handleLicChange('license', 'SELECT'); setIsLicDropdownOpen(false); setLicSearch(''); }}
                            className={licForm.license === 'SELECT' || !licForm.license ? 'selected-item' : ''}
                            onMouseEnter={(e) => { if (licForm.license !== 'SELECT' && licForm.license) e.currentTarget.style.background = '#f5f5f5'; }}
                            onMouseLeave={(e) => { if (licForm.license !== 'SELECT' && licForm.license) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span>SELECT</span>
                            {(!licForm.license || licForm.license === 'SELECT') && <span>✔</span>}
                          </li>
                          {filteredLic.map(opt => (
                            <li
                              key={opt}
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                              onClick={() => { handleLicChange('license', opt); setIsLicDropdownOpen(false); setLicSearch(''); }}
                              className={licForm.license === opt ? 'selected-item' : ''}
                              onMouseEnter={(e) => { if (licForm.license !== opt) e.currentTarget.style.background = '#f5f5f5'; }}
                              onMouseLeave={(e) => { if (licForm.license !== opt) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span>{opt}</span>
                              {licForm.license === opt && <span>✔</span>}
                            </li>
                          ))}
                          {filteredLic.length === 0 && (
                            <li style={{ padding: '8px 12px', color: '#999', fontSize: '0.9rem' }}>No matches found</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {licErrors.license && <span className="error-text">{licErrors.license}</span>}
                </div>
              </div>

              <div className="edu-form-row">
                <label className="edu-form-label" style={{ width: '100px', minWidth: '100px' }}>Valid until</label>
                <div className="edu-form-control">
                  <div className="input-with-button short-input-wrapper" style={{ width: '180px' }}>
                    <input
                      type="date"
                      className={`input-field ${licErrors.validUntil ? 'error-border' : ''}`}
                      value={licForm.validUntil}
                      onChange={(e) => handleLicChange('validUntil', e.target.value)}
                      style={{ borderRight: 'none', borderRadius: '4px 0 0 4px', paddingRight: '5px' }}
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
                  {licErrors.validUntil && <span className="error-text">{licErrors.validUntil}</span>}
                </div>
              </div>

              <div className="modal-actions-centered">
                <button className="btn-save" onClick={handleSaveLic}>Save</button>
                <button className="btn-cancel" onClick={() => setShowLicModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step8;
