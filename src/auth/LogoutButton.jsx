import React from 'react';
import { useAuth } from './AuthContext';

const LogoutButton = () => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'white',
      padding: '10px 20px',
      borderRadius: '50px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
          {user?.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
