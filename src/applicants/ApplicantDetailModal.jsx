import React, { useState } from 'react';
import './ApplicantForm.css';

const ApplicantDetailModal = ({ applicant, onClose, onEdit, isAdmin }) => {
  if (!applicant) return null;

  const formatDate = (dateString) => {
    if (!dateString || dateString === '--') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (dob) => {
    if (!dob || dob === '--') return 'N/A';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ 
          background: '#428bca', 
          color: 'white', 
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Applicant Details</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>View Mode - Read Only</p>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '30px' }}>
          
          {/* Personal Information */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#428bca', 
              borderBottom: '2px solid #428bca', 
              paddingBottom: '8px',
              marginBottom: '20px',
              fontSize: '1.2rem'
            }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailField label="Surname" value={applicant.surname} />
              <DetailField label="First Name" value={applicant.first_name} />
              <DetailField label="Middle Name" value={applicant.middle_name} />
              <DetailField label="Suffix" value={applicant.suffix} />
              <DetailField label="Date of Birth" value={formatDate(applicant.date_of_birth)} />
              <DetailField label="Age" value={calculateAge(applicant.date_of_birth)} />
              <DetailField label="Sex" value={applicant.sex} />
              <DetailField label="Civil Status" value={applicant.civil_status} />
              <DetailField label="Height (cm)" value={applicant.height} />
              <DetailField label="Religion" value={applicant.religion} />
              <DetailField label="Email" value={applicant.email} />
              <DetailField label="Contact Number" value={applicant.contact_number} />
            </div>
          </section>

          {/* Address */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#428bca', 
              borderBottom: '2px solid #428bca', 
              paddingBottom: '8px',
              marginBottom: '20px',
              fontSize: '1.2rem'
            }}>
              Address
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailField label="House No./Street" value={applicant.house_no_street} />
              <DetailField label="Barangay" value={applicant.barangay} />
              <DetailField label="City/Municipality" value={applicant.city_municipality} />
              <DetailField label="Province" value={applicant.province} />
              <DetailField label="Region" value={applicant.region} />
            </div>
          </section>

          {/* Employment Status */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#428bca', 
              borderBottom: '2px solid #428bca', 
              paddingBottom: '8px',
              marginBottom: '20px',
              fontSize: '1.2rem'
            }}>
              Employment Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailField label="Employment Status" value={applicant.employment_status} />
              <DetailField label="Employment Type" value={applicant.employment_type} />
              <DetailField 
                label="Admin Approval Status" 
                value={
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: applicant.approved_by_admin ? '#d4edda' : '#fff3cd',
                    color: applicant.approved_by_admin ? '#155724' : '#856404'
                  }}>
                    {applicant.approved_by_admin ? '✓ APPROVED' : 'PENDING'}
                  </span>
                }
              />
              {applicant.approval_date && (
                <DetailField label="Approval Date" value={formatDate(applicant.approval_date)} />
              )}
            </div>
          </section>

          {/* Registration Details */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: '#428bca', 
              borderBottom: '2px solid #428bca', 
              paddingBottom: '8px',
              marginBottom: '20px',
              fontSize: '1.2rem'
            }}>
              Registration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailField label="Registered On" value={formatDate(applicant.created_at)} />
              {applicant.resume_url && (
                <div>
                  <label style={{ fontWeight: 600, color: '#666', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                    Resume
                  </label>
                  <a 
                    href={applicant.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#5cb85c',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Additional Data (if available) */}
          {applicant.preferred_occupation && (
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                color: '#428bca', 
                borderBottom: '2px solid #428bca', 
                paddingBottom: '8px',
                marginBottom: '20px',
                fontSize: '1.2rem'
              }}>
                Job Preferences
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <DetailField label="Preferred Occupation" value={applicant.preferred_occupation} />
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px 30px', 
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {isAdmin ? (
              <span style={{ color: '#5cb85c', fontWeight: 600 }}>
                ✓ Logged in as Admin - You can edit this applicant
              </span>
            ) : (
              <span>
                💡 Login as admin to edit this applicant's information
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={() => onEdit(applicant)}
                style={{
                  padding: '10px 24px',
                  background: '#428bca',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailField = ({ label, value }) => (
  <div>
    <label style={{ 
      fontWeight: 600, 
      color: '#666', 
      fontSize: '0.85rem',
      display: 'block',
      marginBottom: '4px'
    }}>
      {label}
    </label>
    <div style={{ 
      color: '#333', 
      fontSize: '0.95rem',
      padding: '8px 12px',
      background: '#f8f9fa',
      borderRadius: '4px',
      minHeight: '36px',
      display: 'flex',
      alignItems: 'center'
    }}>
      {value || 'N/A'}
    </div>
  </div>
);

export default ApplicantDetailModal;
