import React, { useState } from 'react';
import { FormProvider, useFormContext } from './FormContext';
import OverviewModal from './OverviewModal';
import SuccessModal from './SuccessModal';
import { mapApplicantToFormData, mapFormDataToApplicant } from '../utils/applicantMapper';
import { useSupabase } from '../hooks/useSupabase';

const EditFlowInner = ({ applicantData, onComplete }) => {
  const { formData } = useFormContext();
  const { updateApplicant } = useSupabase();
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedApplicantId, setSavedApplicantId] = useState(null);

  const handleSubmit = async () => {
    const updates = mapFormDataToApplicant(formData);
    const { error } = await updateApplicant(applicantData.id, updates);
    
    if (error) {
      alert("Error updating applicant: " + error);
    } else {
      setShowSuccess(true);
      // Signal success with the applicant ID so callers can refresh
      setSavedApplicantId(applicantData.id);
    }
  };

  return (
    <>
      {!showSuccess && (
        <OverviewModal 
          onClose={onComplete} 
          onSubmitFinal={handleSubmit} 
        />
      )}
      {showSuccess && (
        <SuccessModal onClose={() => onComplete(savedApplicantId)} />
      )}
    </>
  );
};

const EditApplicantFlow = ({ applicantData, onComplete }) => {
  const initialData = mapApplicantToFormData(applicantData);
  
  return (
    <div className="applicant-container" style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <FormProvider initialData={initialData}>
        <EditFlowInner applicantData={applicantData} onComplete={onComplete} />
      </FormProvider>
    </div>
  );
};

export default EditApplicantFlow;
