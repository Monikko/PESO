import React, { useState, useEffect } from 'react';
import './ApplicantForm.css';

import { useFormContext } from './FormContext';
import { useSupabase } from '../hooks/useSupabase';
import OverviewModal from './OverviewModal';

const Step11 = ({ onPrev, onSubmit, pesoId }) => {
  const { formData: globalFormData, updateFormData } = useFormContext();
  const { submitApplicant, uploadFile, loading, error } = useSupabase();
  const initialData = globalFormData.step11 || {};

  const [formData, setFormData] = useState({
    registrationDate: initialData.registrationDate || '',
    pesoId: pesoId || initialData.pesoId || '',
    assessedBy: initialData.assessedBy || 'SELECT',
    remarks: initialData.remarks || '',
    encodedBy: initialData.encodedBy || 'MAR-SEM G. MENDILLO'
  });

  const [submitting, setSubmitting] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const saveStepData = () => {
    updateFormData({
      step11: formData
    });
  };

  const handleSubmit = async () => {
    saveStepData();
    setSubmitting(true);

    try {
      // Prepare the complete form data for submission
      let photoUrl = null;
      let resumeUrl = null;

      // Upload photo if exists
      if (globalFormData.file) {
        const { data: uploadData, error: uploadError } = await uploadFile(globalFormData.file);
        if (uploadError) {
          alert(`Error uploading photo: ${uploadError}`);
          setSubmitting(false);
          return;
        }
        photoUrl = uploadData?.url;
      }

      // Upload resume if exists
      if (globalFormData.resumeFile) {
        const { data: uploadData, error: uploadError } = await uploadFile(globalFormData.resumeFile);
        if (uploadError) {
          alert(`Error uploading resume: ${uploadError}`);
          setSubmitting(false);
          return;
        }
        resumeUrl = uploadData?.url;
      }

      // Prepare the complete applicant data (matching database schema)
      const applicantData = {
        // Personal Information (Step 1)
        photo_url: photoUrl,
        resume_url: resumeUrl,
        surname: globalFormData.lastName,
        first_name: globalFormData.firstName,
        middle_name: globalFormData.middleName,
        suffix: globalFormData.suffix,
        date_of_birth: globalFormData.dob,
        sex: globalFormData.sex,

        // Personal Information (Step 2)
        civil_status: globalFormData.step2?.civilStatus,
        barangay: globalFormData.step2?.barangay,
        city_municipality: globalFormData.step2?.city,
        province: globalFormData.step2?.province,
        region: 'REGION III',
        email: globalFormData.step2?.email,
        contact_number: globalFormData.step2?.cellphone,
        landline: globalFormData.step2?.landline,
        height: globalFormData.step2?.heightCm ? parseFloat(globalFormData.step2.heightCm) : null,
        religion: globalFormData.step2?.religion,

        // Employment Status (Step 3)
        employment_status: globalFormData.step3?.employmentStatus,
        employment_type: globalFormData.step3?.subStatus,

        // Applicant Classification (from Step 2)
        is_4ps_beneficiary: globalFormData.step2?.is4ps || false,
        household_id: globalFormData.step2?.householdId,

        // Job Preferences (Step 4)
        preferred_occupation: globalFormData.step4?.occupations?.map(o => o.occupation) || [],
        preferred_work_location: [
          ...(globalFormData.step4?.localLocations || []),
          ...(globalFormData.step4?.overseasLocations || [])
        ],

        // Language/Dialects (Step 5)
        languages: globalFormData.step5?.languages || [],

        // Educational Background (Step 6)
        // Store as JSONB array
        // Note: The schema has individual fields but we'll just store the first record
        elementary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.school,
        elementary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.course,
        elementary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('ELEMENTARY')).yearGraduated) : null,
        
        secondary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.school,
        secondary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.course,
        secondary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY')).yearGraduated) : null,
        
        tertiary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.school,
        tertiary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.course,
        tertiary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('COLLEGE')).yearGraduated) : null,

        // Certification/Training (Step 7)
        vocational_courses: {
          certifications: globalFormData.step7?.certifications || [],
          trainings: globalFormData.step7?.trainings || []
        },

        // Eligibility/License (Step 8)
        eligibilities: {
          eligibilities: globalFormData.step8?.eligibilities || [],
          licenses: globalFormData.step8?.licenses || []
        },

        // Work Experience (Step 9)
        work_experiences: globalFormData.step9?.workExperiences || [],

        // Other Skills (Step 10)
        other_skills: globalFormData.step10?.selectedSkills || [],

        // Status
        status: 'pending',
        notes: formData.remarks || '',
        
        // Optional override for testing
        ...(formData.registrationDate ? { created_at: new Date(formData.registrationDate).toISOString() } : {})
      };

      // Submit to Supabase
      const { data, error: submitError } = await submitApplicant(applicantData);

      if (submitError) {
        alert(`Error submitting application: ${submitError}`);
        setSubmitting(false);
        return;
      }

      // Success
      console.log('Application submitted successfully:', data);
      setSubmitting(false);
      onSubmit();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`An unexpected error occurred: ${err.message}`);
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    saveStepData();
    onPrev();
  };

  useEffect(() => {
    // Only set current date if registrationDate is empty
    if (!formData.registrationDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({ ...prev, registrationDate: `${yyyy}-${mm}-${dd}` }));
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreviewClick = () => {
    saveStepData();
    setShowOverview(true);
  };

  return (
    <div className="applicant-container relative-container">

      {/* Overview Modal */}
      {showOverview && (
        <OverviewModal 
          onClose={() => setShowOverview(false)} 
          onSubmitFinal={handleSubmit}
        />
      )}

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>REGISTRATION DETAILS</h2>
          <span className="step-indicator">Step 11 of 11</span>
        </div>

        <div className="form-body form-modal-body" style={{ padding: '30px 40px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Registration Date */}
          <div className="edu-form-row">
            <label className="edu-form-label" style={{ width: '130px', minWidth: '130px' }}>Registration date</label>
            <div className="edu-form-control">
              <div className="input-with-button" style={{ display: 'flex', width: '250px' }}>
                <input 
                  type="date"
                  className="input-field"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                  style={{ borderRight: 'none', borderRadius: '4px 0 0 4px', flex: 1, color: '#333', backgroundColor: '#fff' }}
                />
                <button type="button" className="icon-btn search-btn" style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '0 4px 4px 0', borderLeft: 'none', width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* PESO ID */}
          <div className="edu-form-row">
            <label className="edu-form-label" style={{ width: '130px', minWidth: '130px' }}>PESO ID</label>
            <div className="edu-form-control">
              <div className="input-with-button" style={{ display: 'flex', width: '350px' }}>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.pesoId}
                  readOnly
                  style={{ borderRight: 'none', borderRadius: '4px 0 0 4px', flex: 1, backgroundColor: '#f5f5f5', color: '#777' }}
                />
                <button type="button" className="icon-btn search-btn" disabled style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '0 4px 4px 0', borderLeft: 'none', width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Assessed By */}
          <div className="edu-form-row">
            <label className="edu-form-label" style={{ width: '130px', minWidth: '130px' }}>Assessed by</label>
            <div className="edu-form-control">
              <select 
                className="edu-select"
                value={formData.assessedBy}
                onChange={(e) => handleChange('assessedBy', e.target.value)}
                style={{ width: '350px', color: '#999' }}
              >
                <option value="SELECT">SELECT</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div className="edu-form-row">
            <label className="edu-form-label" style={{ width: '130px', minWidth: '130px' }}>Remarks</label>
            <div className="edu-form-control">
              <textarea 
                className="input-field"
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                style={{ width: '100%', minHeight: '60px', resize: 'both' }}
              />
            </div>
          </div>

          {/* Encoded By */}
          <div className="edu-form-row">
            <label className="edu-form-label" style={{ width: '130px', minWidth: '130px' }}>Encoded by</label>
            <div className="edu-form-control">
              <input 
                type="text" 
                className="input-field"
                value={formData.encodedBy}
                readOnly
                style={{ width: '350px', backgroundColor: '#f5f5f5', color: '#777' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev} disabled={submitting}>Previous</button>
        <button 
          className="nav-btn next-btn" 
          style={{ background: '#337ab7', borderColor: '#2e6da4' }} 
          onClick={handlePreviewClick}
          disabled={submitting}
        >
          Preview & Submit
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px', padding: '10px', background: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Step11;
