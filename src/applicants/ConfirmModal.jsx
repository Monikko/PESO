import React from 'react';
import './ApplicantForm.css';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-body" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f0ad4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', margin: '0 0 30px' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 24px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 24px',
                background: '#5cb85c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
