import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ApplicantForm.css';

const ApplicantDetailModal = ({ applicant, onClose }) => {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicant?.id) {
      fetchFullApplicantData();
    }
  }, [applicant?.id]);

  const fetchFullApplicantData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', applicant.id)
        .single();

      if (error) throw error;
      setFullData(data);
    } catch (err) {
      console.error('Error fetching applicant data:', err);
      alert('Error loading applicant details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!applicant) return null;
  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '900px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading applicant details...</div>
        </div>
      </div>
    );
  }

  const data = fullData || applicant;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-resume, .printable-resume * {
            visibility: visible;
          }
          .printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .modal-overlay {
            background: white !important;
          }
          .print-page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="modal-overlay no-print" onClick={onClose}>
        <div 
          className="modal-content printable-resume" 
          style={{ 
            maxWidth: '900px', 
            maxHeight: '90vh', 
            overflow: 'auto',
            background: 'white'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ResumeContent data={data} />
          
          {/* Footer - Hidden on print */}
          <div className="no-print" style={{ 
            background: '#f8f9fa', 
            padding: '20px 30px', 
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 24px',
                background: '#5cb85c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🖨️ Print Resume
            </button>
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
          </div>
        </div>
      </div>
    </>
  );
};

// Resume Content Component
const ResumeContent = ({ data }) => {
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
      return age + ' years old';
    } catch {
      return 'N/A';
    }
  };

  const fullName = `${data.first_name || ''} ${data.middle_name || ''} ${data.surname || ''} ${data.suffix || ''}`.trim();
  const fullAddress = [data.barangay, data.city_municipality, data.province, data.region].filter(Boolean).join(', ');

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: 1.6 }}>
      
      {/* Header - Name and Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #2c3e50', paddingBottom: '16px' }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '2.2rem', 
          fontWeight: 'bold',
          color: '#2c3e50',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {fullName}
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '1.1rem', 
          color: '#7f8c8d',
          fontWeight: 600
        }}>
          {data.employment_status === 'UNEMPLOYED' ? 'Job Seeker' : data.employment_status || 'Professional'}
        </p>
      </div>

      {/* Contact Information */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '24px', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        fontSize: '0.9rem',
        color: '#555'
      }}>
        {data.contact_number && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📱</span>
            <span>{data.contact_number}</span>
          </div>
        )}
        {data.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✉️</span>
            <span>{data.email}</span>
          </div>
        )}
        {fullAddress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📍</span>
            <span>{fullAddress}</span>
          </div>
        )}
      </div>

      {/* Personal Information Section */}
      <Section title="PERSONAL INFORMATION">
        <InfoGrid>
          <InfoItem label="Date of Birth" value={formatDate(data.date_of_birth)} />
          <InfoItem label="Age" value={calculateAge(data.date_of_birth)} />
          <InfoItem label="Sex" value={data.sex} />
          <InfoItem label="Civil Status" value={data.civil_status} />
          <InfoItem label="Height" value={data.height ? `${data.height} cm` : 'N/A'} />
          <InfoItem label="Religion" value={data.religion} />
        </InfoGrid>
      </Section>

      {/* Job Preferences */}
      {data.preferred_occupation && data.preferred_occupation.length > 0 && (
        <Section title="PREFERRED OCCUPATION">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {data.preferred_occupation.map((occ, idx) => (
              <li key={idx} style={{ marginBottom: '4px', color: '#555' }}>{occ}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Educational Background */}
      {(data.elementary_school || data.secondary_school || data.tertiary_school || data.graduate_school) && (
        <Section title="EDUCATION">
          {data.graduate_school && (
            <EducationItem 
              level="Post Graduate Studies"
              school={data.graduate_school}
              course={data.graduate_course}
              year={data.graduate_year_graduated}
              level_attained={data.graduate_level}
              awards={data.graduate_awards}
            />
          )}
          {data.tertiary_school && (
            <EducationItem 
              level="College/Tertiary"
              school={data.tertiary_school}
              course={data.tertiary_course}
              year={data.tertiary_year_graduated}
              level_attained={data.tertiary_level}
              awards={data.tertiary_awards}
            />
          )}
          {data.secondary_school && (
            <EducationItem 
              level="Secondary/High School"
              school={data.secondary_school}
              course={data.secondary_course}
              year={data.secondary_year_graduated}
              level_attained={data.secondary_level}
              awards={data.secondary_awards}
            />
          )}
          {data.elementary_school && (
            <EducationItem 
              level="Elementary"
              school={data.elementary_school}
              course={data.elementary_course}
              year={data.elementary_year_graduated}
              level_attained={data.elementary_level}
              awards={data.elementary_awards}
            />
          )}
        </Section>
      )}

      {/* Vocational Training / Certifications */}
      {data.vocational_courses && (data.vocational_courses.certifications?.length > 0 || data.vocational_courses.trainings?.length > 0) && (
        <Section title="VOCATIONAL TRAINING & CERTIFICATIONS">
          {data.vocational_courses.certifications?.map((cert, idx) => (
            <div key={idx} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #3498db' }}>
              <div style={{ fontWeight: 600, color: '#2c3e50' }}>{cert.certificate}</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                {cert.duration} {cert.durationUnit} • {cert.institution}
              </div>
              {cert.dateStarted && <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                {cert.dateStarted} - {cert.dateFinished || 'Present'}
              </div>}
            </div>
          ))}
          {data.vocational_courses.trainings?.map((training, idx) => (
            <div key={idx} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #9b59b6' }}>
              <div style={{ fontWeight: 600, color: '#2c3e50' }}>{training.training}</div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                {training.hours} hours • {training.institution}
              </div>
              {training.dateStarted && <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                {training.dateStarted} - {training.dateFinished || 'Present'}
              </div>}
            </div>
          ))}
        </Section>
      )}

      {/* Eligibility & Licenses */}
      {data.eligibilities && (data.eligibilities.eligibilities?.length > 0 || data.eligibilities.licenses?.length > 0) && (
        <Section title="ELIGIBILITY & PROFESSIONAL LICENSES">
          {data.eligibilities.eligibilities?.map((elig, idx) => (
            <div key={idx} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#ecf0f1', borderRadius: '4px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{elig.eligibility}</div>
                {elig.rating && <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Rating: {elig.rating}</div>}
              </div>
              {elig.dateConferred && (
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{elig.dateConferred}</div>
              )}
            </div>
          ))}
          {data.eligibilities.licenses?.map((lic, idx) => (
            <div key={idx} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#e8f5e9', borderRadius: '4px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{lic.license}</div>
                {lic.licenseNumber && <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>License #: {lic.licenseNumber}</div>}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d', textAlign: 'right' }}>
                {lic.dateOfValidity && <div>Valid until: {lic.dateOfValidity}</div>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Work Experience */}
      {data.work_experiences && data.work_experiences.length > 0 && (
        <Section title="WORK EXPERIENCE">
          {data.work_experiences.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: '3px solid #e67e22' }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#2c3e50' }}>{exp.position}</div>
              <div style={{ fontSize: '0.95rem', color: '#7f8c8d', marginBottom: '4px' }}>{exp.companyName}</div>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6', marginBottom: '8px' }}>
                {exp.fromMonth}/{exp.fromYear} - {exp.toMonth}/{exp.toYear}
              </div>
              {exp.monthlySalary && (
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Monthly Salary: ₱{parseFloat(exp.monthlySalary).toLocaleString()}
                </div>
              )}
              {exp.statusOfAppointment && (
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Status: {exp.statusOfAppointment}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {data.other_skills && data.other_skills.length > 0 && (
        <Section title="SKILLS">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.other_skills.map((skill, idx) => (
              <span key={idx} style={{
                padding: '6px 14px',
                background: '#3498db',
                color: 'white',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <Section title="LANGUAGES">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {data.languages.map((lang, idx) => (
              <div key={idx} style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #16a085' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50' }}>{lang.language}</div>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Read: {lang.read} • Write: {lang.write} • Speak: {lang.speak} • Understand: {lang.understand}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Additional Information */}
      {(data.actively_looking_for_work || data.willing_to_work_immediately || data.four_ps_beneficiary) && (
        <Section title="ADDITIONAL INFORMATION">
          <InfoGrid>
            {data.actively_looking_for_work !== null && (
              <InfoItem label="Actively Looking for Work" value={data.actively_looking_for_work ? 'Yes' : 'No'} />
            )}
            {data.willing_to_work_immediately !== null && (
              <InfoItem label="Willing to Work Immediately" value={data.willing_to_work_immediately ? 'Yes' : 'No'} />
            )}
            {data.four_ps_beneficiary !== null && (
              <InfoItem label="4Ps Beneficiary" value={data.four_ps_beneficiary ? 'Yes' : 'No'} />
            )}
          </InfoGrid>
        </Section>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '2px solid #ecf0f1',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#95a5a6'
      }}>
        <div>Application registered on: {formatDate(data.created_at)}</div>
        <div style={{ marginTop: '4px' }}>
          Status: <span style={{ 
            fontWeight: 600, 
            color: data.approved_by_admin ? '#27ae60' : '#f39c12' 
          }}>
            {data.approved_by_admin ? 'APPROVED' : 'PENDING APPROVAL'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div style={{ marginBottom: '28px' }}>
    <h2 style={{ 
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '2px solid #3498db',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {title}
    </h2>
    {children}
  </div>
);

const InfoGrid = ({ children }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
    gap: '12px',
    marginTop: '12px'
  }}>
    {children}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 600, marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '0.95rem', color: '#2c3e50' }}>
      {value || 'N/A'}
    </div>
  </div>
);

const EducationItem = ({ level, school, course, year, level_attained, awards }) => (
  <div style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: '3px solid #2ecc71' }}>
    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#2c3e50' }}>{level}</div>
    <div style={{ fontSize: '0.95rem', color: '#555', marginTop: '4px' }}>{school || 'N/A'}</div>
    {course && <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Course: {course}</div>}
    {year && <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>Year Graduated: {year}</div>}
    {level_attained && <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>Level: {level_attained}</div>}
    {awards && <div style={{ fontSize: '0.85rem', color: '#16a085', fontStyle: 'italic' }}>Awards: {awards}</div>}
  </div>
);

export default ApplicantDetailModal;
