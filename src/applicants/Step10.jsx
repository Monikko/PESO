import React, { useState } from 'react';
import './ApplicantForm.css';

import { useFormContext } from './FormContext';

const PREDEFINED_SKILLS = [
  "AUTO MECHANIC",
  "BEAUTICIAN",
  "CARPENTRY WORK",
  "COMPUTER LITERATE",
  "DOMESTIC CHORES",
  "DRIVING",
  "ELECTRICIAN",
  "EMBROIDERY",
  "GARDENING",
  "MASONRY",
  "PAINTER/ARTIST",
  "PAINTING JOBS",
  "PHOTOGRAPHY",
  "SEWING DRESSES",
  "STENOGRAPHY",
  "TAILORING"
];

const Step10 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step10 || {};

  const [selectedSkills, setSelectedSkills] = useState(initialData.selectedSkills || []);
  const [customSkill, setCustomSkill] = useState('');

  const saveStepData = () => {
    updateFormData({
      step10: {
        selectedSkills
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

  const handleCheckboxChange = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !PREDEFINED_SKILLS.includes(customSkill.toUpperCase().trim()) && !selectedSkills.includes(customSkill.toUpperCase().trim())) {
      setSelectedSkills(prev => [...prev, customSkill.toUpperCase().trim()]);
    }
    setCustomSkill('');
  };

  // Split predefined into two columns
  const leftColumnSkills = PREDEFINED_SKILLS.slice(0, 8);
  const rightColumnSkills = PREDEFINED_SKILLS.slice(8);

  // Custom skills that are not in predefined
  const addedCustomSkills = selectedSkills.filter(s => !PREDEFINED_SKILLS.includes(s));

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>OTHER SKILLS ACQUIRED WITHOUT FORMAL TRAINING</h2>
          <span className="step-indicator">Step 10 of 11</span>
        </div>

        <div className="form-body" style={{ padding: '30px 40px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '30px' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              {leftColumnSkills.map(skill => (
                <label key={skill} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleCheckboxChange(skill)}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ color: '#333', fontSize: '0.9rem' }}>{skill}</span>
                </label>
              ))}
            </div>
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              {rightColumnSkills.map(skill => (
                <label key={skill} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleCheckboxChange(skill)}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ color: '#333', fontSize: '0.9rem' }}>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="others-section" style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#333', fontSize: '0.9rem', marginBottom: '10px' }}>OTHERS</h4>
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '400px' }}>
              <input 
                type="text"
                className="input-field"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSkill(); }}
                style={{ flex: 1, borderRadius: '3px 0 0 3px', borderRight: 'none' }}
              />
              <button 
                onClick={handleAddCustomSkill}
                style={{ 
                  padding: '7px 20px', 
                  background: '#f5f5f5', 
                  border: '1px solid #ccc', 
                  borderRadius: '0 3px 3px 0',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>

            {addedCustomSkills.length > 0 && (
              <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {addedCustomSkills.map(skill => (
                  <span key={skill} className="occupation-tag">
                    {skill}
                    <button 
                      className="remove-tag-btn"
                      onClick={() => handleCheckboxChange(skill)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>
    </div>
  );
};

export default Step10;
