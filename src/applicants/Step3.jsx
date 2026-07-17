import React, { useState } from 'react';
import './ApplicantForm.css';
import { useFormContext } from './FormContext';

const Step3 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step3 || {};

  const [employmentStatus, setEmploymentStatus] = useState(initialData.employmentStatus || '');
  const [subStatus, setSubStatus] = useState(initialData.subStatus || '');
  const [lookingForWorkMonths, setLookingForWorkMonths] = useState(initialData.lookingForWorkMonths || '');

  const handleStatusChange = (status) => {
    setEmploymentStatus(status);
    setSubStatus(''); // reset sub status when main status changes
  };

  const saveStepData = () => {
    updateFormData({
      step3: {
        employmentStatus,
        subStatus,
        lookingForWorkMonths
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

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>EMPLOYMENT STATUS</h2>
          <span className="step-indicator">Step 3 of 11</span>
        </div>

        <div className="form-body">
          <div className="form-row">
            <label>Employment status</label>
            <div className="radio-group row-group">
              <label>
                <input 
                  type="radio" 
                  name="empStatus" 
                  checked={employmentStatus === 'employed'} 
                  onChange={() => handleStatusChange('employed')} 
                /> Employed
              </label>
              <label>
                <input 
                  type="radio" 
                  name="empStatus" 
                  checked={employmentStatus === 'unemployed'} 
                  onChange={() => handleStatusChange('unemployed')} 
                /> Unemployed
              </label>
            </div>
          </div>

          <div className="form-row">
            <label></label>
            <div className="radio-group column-group">
              {employmentStatus === 'employed' && (
                <>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'wage'} onChange={() => setSubStatus('wage')} /> Wage employed</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'self'} onChange={() => setSubStatus('self')} /> Self-employed</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'others'} onChange={() => setSubStatus('others')} /> Others</label>
                </>
              )}
              {employmentStatus === 'unemployed' && (
                <>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'new_entrant'} onChange={() => setSubStatus('new_entrant')} /> New entrant/fresh graduate</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'finished_contract'} onChange={() => setSubStatus('finished_contract')} /> Finished contract</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'resigned'} onChange={() => setSubStatus('resigned')} /> Resigned</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'retired'} onChange={() => setSubStatus('retired')} /> Retired</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'terminated_calamity'} onChange={() => setSubStatus('terminated_calamity')} /> Terminated/Laid off due to calamity</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'terminated_local'} onChange={() => setSubStatus('terminated_local')} /> Terminated/Laid off (local)</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'terminated_abroad'} onChange={() => setSubStatus('terminated_abroad')} /> Terminated/Laid off (abroad)</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'displaced_pogo'} onChange={() => setSubStatus('displaced_pogo')} /> Displaced POGO Worker</label>
                  <label><input type="radio" name="subStatus" checked={subStatus === 'others'} onChange={() => setSubStatus('others')} /> Others</label>
                </>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>How long have you been<br/>looking for work?</label>
            <div className="input-group-append" style={{ maxWidth: '200px' }}>
              <input 
                type="number" 
                className="input-field" 
                value={lookingForWorkMonths}
                onChange={(e) => setLookingForWorkMonths(e.target.value)}
              />
              <span className="input-append-label">months</span>
            </div>
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

export default Step3;
