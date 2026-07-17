import React, { useState } from 'react';
import './ApplicantForm.css';

const PesoSelection = ({ onContinue }) => {
  const [selectedPeso, setSelectedPeso] = useState('');

  const pesoOptions = [
    'PALAYAN CITY (NUEVA ECIJA)',
    'CABANATUAN CITY (NUEVA ECIJA)',
    'GAPAN CITY (NUEVA ECIJA)',
    'SAN JOSE CITY (NUEVA ECIJA)',
    'SCIENCE CITY OF MUÑOZ (NUEVA ECIJA)',
    'ALIAGA (NUEVA ECIJA)',
    'BONGABON (NUEVA ECIJA)',
    'CABIAO (NUEVA ECIJA)',
    'CARRANGLAN (NUEVA ECIJA)',
    'CUYAPO (NUEVA ECIJA)',
    'GABALDON (NUEVA ECIJA)',
    'GENERAL MAMERTO NATIVIDAD (NUEVA ECIJA)',
    'GENERAL TINIO (NUEVA ECIJA)',
    'GUIMBA (NUEVA ECIJA)',
    'JAEN (NUEVA ECIJA)',
    'LAUR (NUEVA ECIJA)',
    'LICAB (NUEVA ECIJA)',
    'LLANERA (NUEVA ECIJA)',
    'LUPAO (NUEVA ECIJA)',
    'NAMPICUAN (NUEVA ECIJA)',
    'PANTABANGAN (NUEVA ECIJA)',
    'PEÑARANDA (NUEVA ECIJA)',
    'QUEZON (NUEVA ECIJA)',
    'RIZAL (NUEVA ECIJA)',
    'SAN ANTONIO (NUEVA ECIJA)',
    'SAN ISIDRO (NUEVA ECIJA)',
    'SAN LEONARDO (NUEVA ECIJA)',
    'SANTA ROSA (NUEVA ECIJA)',
    'SANTO DOMINGO (NUEVA ECIJA)',
    'TALAVERA (NUEVA ECIJA)',
    'TALUGTUG (NUEVA ECIJA)',
    'ZARAGOZA (NUEVA ECIJA)'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPeso) {
      onContinue(selectedPeso);
    }
  };

  return (
    <div className="applicant-container">
      <div className="form-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="form-header">
          <h2>WELCOME TO PESO REGISTRATION</h2>
        </div>

        <div className="form-body" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '10px' }}>Select Your PESO Office</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Please select the Public Employment Service Office (PESO) where you want to register.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label 
                htmlFor="peso" 
                style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 600, 
                  color: '#555',
                  fontSize: '0.95rem'
                }}
              >
                PESO Office <span style={{ color: '#d9534f' }}>*</span>
              </label>
              <select
                id="peso"
                className="input-field"
                value={selectedPeso}
                onChange={(e) => setSelectedPeso(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <option value="">-- SELECT PESO OFFICE --</option>
                {pesoOptions.map((peso) => (
                  <option key={peso} value={peso}>
                    {peso}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="nav-btn next-btn"
              disabled={!selectedPeso}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: !selectedPeso ? 0.5 : 1,
                cursor: !selectedPeso ? 'not-allowed' : 'pointer'
              }}
            >
              Continue to Registration Form
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.6' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Important:</strong>
                Make sure to select the correct PESO office for your location. This information will be used for processing your application.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PesoSelection;
