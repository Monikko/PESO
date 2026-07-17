import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ onClose }) => {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal-content">
        <div className="success-checkmark-container">
          <svg className="success-checkmark" viewBox="0 0 52 52">
            <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h2 className="success-title">Registration Successful!</h2>
        <p className="success-message">Your application has been submitted successfully.</p>
        
        <button className="success-ok-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
