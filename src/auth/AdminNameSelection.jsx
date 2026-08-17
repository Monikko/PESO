import React, { useState } from 'react';
import './LoginPage.css';

const AdminNameSelection = ({ onSelectName, onBack }) => {
  const [selectedName, setSelectedName] = useState('');

  const predefinedAdmins = [
    "Ma'am Jennifer",
    "Ma'am Mar-sem"
  ];

  const handleNameSelect = (name) => {
    setSelectedName(name);
    // Auto-redirect to dashboard immediately after selection
    onSelectName(name);
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

        <div className="login-form">
          <h2>Who is using the admin dashboard?</h2>
          
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#666', 
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Select your name to continue
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {predefinedAdmins.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleNameSelect(name)}
                style={{
                  padding: '20px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNameSelection;
