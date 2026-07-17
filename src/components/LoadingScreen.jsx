import React from 'react';
import CircularText from './CircularText';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="circular-text-wrapper">
          <CircularText 
            text="PESO PALAYAN CITY • APPLICANT REGISTRATION SYSTEM • " 
            spinDuration={20}
            onHover="speedUp"
            className="custom-circular"
          />
          
          {/* Center logo */}
          <div className="center-logo">
            <span className="logo-text">PESO</span>
          </div>
        </div>
        
        <h1 className="loading-title">Loading...</h1>
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
