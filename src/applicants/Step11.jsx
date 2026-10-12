import React, { useState, useEffect } from 'react';
import './ApplicantForm.css';

import { useFormContext } from './FormContext';
import { useSupabase } from '../hooks/useSupabase';
import { supabase } from '../supabaseClient';
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
  const [duplicateModal, setDuplicateModal] = useState({
    show: false,
    existingName: '',
    newName: '',
    matchReasons: []
  });

  const saveStepData = () => {
    updateFormData({
      step11: formData
    });
  };

  const handleSubmit = async () => {
    saveStepData();
    setSubmitting(true);

    try {
      console.log('=== STARTING DUPLICATE CHECK ===');
      console.log('Applicant data:', {
        surname: globalFormData.lastName,
        firstName: globalFormData.firstName,
        middleName: globalFormData.middleName,
        contactNumber: globalFormData.step2?.cellphone,
        email: globalFormData.step2?.email
      });

      // CRITICAL: Comprehensive duplicate detection
      // This must complete before allowing registration
      
      // Check 1: By name (surname + first name)
      console.log('Check 1: Searching by name...');
      const { data: existingByName, error: checkError1 } = await supabase
        .from('applicants')
        .select('id, surname, first_name, middle_name, contact_number, email')
        .ilike('surname', globalFormData.lastName)
        .ilike('first_name', globalFormData.firstName)
        .is('deleted_at', null);

      console.log('Found by name:', existingByName?.length || 0, existingByName);

      // Check 2: By contact number (if provided)
      let existingByContact = [];
      if (globalFormData.step2?.cellphone) {
        console.log('Check 2: Searching by contact number...');
        const cleanContact = globalFormData.step2.cellphone.replace(/\D/g, '');
        const { data: contactData, error: checkError2 } = await supabase
          .from('applicants')
          .select('id, surname, first_name, middle_name, contact_number, email')
          .ilike('contact_number', `%${cleanContact}%`)
          .is('deleted_at', null);
        existingByContact = contactData || [];
        console.log('Found by contact:', existingByContact.length, existingByContact);
      }

      // Check 3: By email (if provided)
      let existingByEmail = [];
      if (globalFormData.step2?.email) {
        console.log('Check 3: Searching by email...');
        const { data: emailData, error: checkError3 } = await supabase
          .from('applicants')
          .select('id, surname, first_name, middle_name, contact_number, email')
          .ilike('email', globalFormData.step2.email)
          .is('deleted_at', null);
        existingByEmail = emailData || [];
        console.log('Found by email:', existingByEmail.length, existingByEmail);
      }

      // Combine all results (remove duplicates by id)
      const allExisting = [...(existingByName || []), ...existingByContact, ...existingByEmail];
      const existingApplicants = Array.from(
        new Map(allExisting.map(item => [item.id, item])).values()
      );

      console.log('Total unique existing applicants found:', existingApplicants.length);

      if (checkError1) {
        console.error('❌ Error checking for duplicates:', checkError1);
      }

      if (existingApplicants && existingApplicants.length > 0) {
        // Check if any existing applicant matches our criteria
        const isDuplicate = existingApplicants.some(existing => {
          console.log('Checking existing applicant:', existing);
          
          // Match by name (surname + first name + middle name)
          const nameMatch = 
            existing.surname?.toUpperCase() === globalFormData.lastName?.toUpperCase() &&
            existing.first_name?.toUpperCase() === globalFormData.firstName?.toUpperCase() &&
            (existing.middle_name?.toUpperCase() || '') === (globalFormData.middleName?.toUpperCase() || '');

          console.log('Name match:', nameMatch);

          // Match by contact number
          const contactMatch = 
            existing.contact_number && 
            globalFormData.step2?.cellphone &&
            existing.contact_number.replace(/\D/g, '') === globalFormData.step2.cellphone.replace(/\D/g, '');

          console.log('Contact match:', contactMatch, {
            existing: existing.contact_number?.replace(/\D/g, ''),
            new: globalFormData.step2?.cellphone?.replace(/\D/g, '')
          });

          // Match by email (if both exist)
          const emailMatch = 
            existing.email && 
            globalFormData.step2?.email &&
            existing.email.toLowerCase() === globalFormData.step2.email.toLowerCase();

          console.log('Email match:', emailMatch, {
            existing: existing.email?.toLowerCase(),
            new: globalFormData.step2?.email?.toLowerCase()
          });

          // STRICTER DUPLICATE DETECTION:
          // Consider it a duplicate if ANY of these conditions are true:
          // 1. Full name matches (surname + first name + middle name) - likely same person
          // 2. Contact number matches (even if name is slightly different)
          // 3. Email matches (even if name is slightly different)
          const isDup = nameMatch || contactMatch || emailMatch;
          console.log('Is duplicate?', isDup);
          
          return isDup;
        });

        if (isDuplicate) {
          console.log('⚠️ DUPLICATE DETECTED!');
          
          const existingMatch = existingApplicants.find(existing => {
            const nameMatch = 
              existing.surname?.toUpperCase() === globalFormData.lastName?.toUpperCase() &&
              existing.first_name?.toUpperCase() === globalFormData.firstName?.toUpperCase() &&
              (existing.middle_name?.toUpperCase() || '') === (globalFormData.middleName?.toUpperCase() || '');

            const contactMatch = 
              existing.contact_number && 
              globalFormData.step2?.cellphone &&
              existing.contact_number.replace(/\D/g, '') === globalFormData.step2.cellphone.replace(/\D/g, '');

            const emailMatch = 
              existing.email && 
              globalFormData.step2?.email &&
              existing.email.toLowerCase() === globalFormData.step2.email.toLowerCase();

            return nameMatch || contactMatch || emailMatch;
          });

          const fullName = `${globalFormData.lastName}, ${globalFormData.firstName} ${globalFormData.middleName || ''}`.trim();
          const existingFullName = `${existingMatch.surname}, ${existingMatch.first_name} ${existingMatch.middle_name || ''}`.trim();
          const matchReason = [];
          
          // Check what matched
          const nameMatches = 
            existingMatch.surname?.toUpperCase() === globalFormData.lastName?.toUpperCase() &&
            existingMatch.first_name?.toUpperCase() === globalFormData.firstName?.toUpperCase() &&
            (existingMatch.middle_name?.toUpperCase() || '') === (globalFormData.middleName?.toUpperCase() || '');
          
          if (nameMatches) {
            matchReason.push(`✓ Name: ${fullName}`);
          }
          
          if (existingMatch.contact_number && globalFormData.step2?.cellphone &&
              existingMatch.contact_number.replace(/\D/g, '') === globalFormData.step2.cellphone.replace(/\D/g, '')) {
            matchReason.push(`✓ Contact Number: ${globalFormData.step2.cellphone}`);
          }
          
          if (existingMatch.email && globalFormData.step2?.email &&
              existingMatch.email.toLowerCase() === globalFormData.step2.email.toLowerCase()) {
            matchReason.push(`Email: ${globalFormData.step2.email}`);
          }

          // Show custom modal instead of alert
          setDuplicateModal({
            show: true,
            existingName: existingFullName,
            newName: fullName,
            matchReasons: matchReason
          });
          
          console.error('🚫 REGISTRATION BLOCKED - Duplicate detected');
          setSubmitting(false);
          return; // CRITICAL: Stop execution here
        } else {
          console.log('✅ No duplicate found - proceeding with registration');
        }
      } else {
        console.log('✅ No existing applicants with same name - proceeding with registration');
      }

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
                  placeholder="PESO ID (Auto-generated)"
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
                placeholder="Enter any additional remarks..."
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
                placeholder="Encoder's Name (Auto-filled)"
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

      {/* Duplicate Detection Modal */}
      {duplicateModal.show && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setDuplicateModal({ show: false, existingName: '', newName: '', matchReasons: [] })}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'slideDown 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              padding: '24px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                DUPLICATE APPLICANT DETECTED
              </h2>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 28px' }}>
              <p style={{ 
                fontSize: '1rem', 
                color: '#555', 
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                This applicant is already registered in the system.
              </p>

              {/* Existing vs New */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6c757d', 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    Existing Record:
                  </div>
                  <div style={{ 
                    fontSize: '1.05rem', 
                    color: '#2c3e50', 
                    fontWeight: 700 
                  }}>
                    {duplicateModal.existingName}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6c757d', 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    Your Entry:
                  </div>
                  <div style={{ 
                    fontSize: '1.05rem', 
                    color: '#2c3e50', 
                    fontWeight: 700 
                  }}>
                    {duplicateModal.newName}
                  </div>
                </div>
              </div>

              {/* Matching Information */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  color: '#2c3e50',
                  marginBottom: '12px'
                }}>
                  Matching Information:
                </div>
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  {duplicateModal.matchReasons.map((reason, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        fontSize: '0.9rem', 
                        color: '#856404',
                        marginBottom: idx < duplicateModal.matchReasons.length - 1 ? '6px' : 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ color: '#28a745', fontSize: '1rem' }}>✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Message */}
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '24px'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: '#856404',
                  lineHeight: '1.5'
                }}>
                  <strong>Registration cannot proceed</strong> to prevent duplicate records. 
                  If you believe this is an error, please contact the PESO office.
                </p>
              </div>

              {/* OK Button */}
              <button
                onClick={() => setDuplicateModal({ show: false, existingName: '', newName: '', matchReasons: [] })}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                OK, I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step11;
