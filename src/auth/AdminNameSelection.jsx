import React, { useState } from 'react';
import './LoginPage.css';

const AdminNameSelection = ({ onSelectName, onBack }) => {
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const predefinedAdmins = [
    'Maria Santos',
    'Juan Dela Cruz',
    'Ana Reyes',
    'Pedro Garcia',
    'Linda Torres',
    'Carlos Mendoza'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminName = showCustomInput ? customName.trim() : selectedName;
    
    if (!adminName) {
      alert('Please select or enter your name');
      return;
    }

    onSelectName(adminName);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PESO Palayan City</h1>
          <p>Select Your Name</p>
        </div>

        <button type="button" onClick={onBack} className="back-btn">
          ← Back to Login
        </button>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Who is using the admin dashboard?</h2>
          
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#666', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            This helps track who approved each applicant
          </p>

          {!showCustomInput ? (
            <>
              <div className="form-group">
                <label>Select Your Name</label>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select Your Name --</option>
                  {predefinedAdmins.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#337ab7',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  My name is not in the list
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Enter Your Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomName('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#337ab7',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  ← Choose from list instead
                </button>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="login-btn"
            style={{ marginTop: '20px' }}
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNameSelection;
