import React, { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import Step6 from './Step6';
import Step7 from './Step7';
import Step8 from './Step8';
import Step9 from './Step9';
import Step10 from './Step10';
import Step11 from './Step11';
import { FormProvider } from './FormContext';
import OverviewModal from './OverviewModal';
import SuccessModal from './SuccessModal';
import PesoSelection from './PesoSelection';
import ApplicantsDashboard from './ApplicantsDashboard';
import ConfirmModal from './ConfirmModal';

const STEPS = [
  { num: 1,  label: 'Personal\nInformation' },
  { num: 2,  label: 'Employment\nStatus' },
  { num: 3,  label: 'Applicant\nClassification' },
  { num: 4,  label: 'Job\nPreferences' },
  { num: 5,  label: 'Language /\nDialects' },
  { num: 6,  label: 'Educational\nBackground' },
  { num: 7,  label: 'Certification /\nTraining' },
  { num: 8,  label: 'Eligibility /\nLicense' },
  { num: 9,  label: 'Work\nExperience' },
  { num: 10, label: 'Other\nSkills' },
  { num: 11, label: 'Registration\nDetails' },
];

const ApplicantForm = ({ user, onLogout, onAdminAccess }) => {
  const [step, setStep] = useState(-1); // Start at -1 for dashboard
  const [flippingStep, setFlippingStep] = useState(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key to force FormProvider reset
  const FIXED_PESO = 'PALAYAN CITY (NUEVA ECIJA)'; // Fixed PESO for Palayan
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  console.log('ApplicantForm rendering, step:', step);

  const handleNext = () => {
    const completingStep = step;
    setFlippingStep(completingStep);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setFlippingStep(null);
    }, 200); // wait for flip to complete before advancing
  };

  const handlePrev = () => setStep(prev => prev - 1);

  const handleGoToStep = (stepNumber) => {
    setStep(stepNumber);
    setIsOverviewOpen(false);
  };

  const handleFormSubmit = () => {
    setIsOverviewOpen(false);
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset the form
    setStep(-1); // Go back to dashboard
    setFlippingStep(null);
    setFormKey(prev => prev + 1); // Force FormProvider to reset by changing key
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewApplicant = () => {
    setStep(1); // Go directly to Step 1 (skip PESO selection since it's always Palayan)
  };

  const handleBackToSearch = () => {
    setShowBackConfirm(true);
  };

  const confirmBackToSearch = () => {
    setShowBackConfirm(false);
    setStep(-1);
    setFormKey(prev => prev + 1); // Reset form
  };

  return (
    <FormProvider key={formKey}>
      <div>
      {/* Show Dashboard first */}
      {step === -1 && <ApplicantsDashboard onAddNewApplicant={handleAddNewApplicant} user={user} onLogout={onLogout} onAdminAccess={onAdminAccess} />}

      {/* Show progress stepper and steps (no PESO selection needed) */}
      {step > 0 && (
        <>
      {/* Back to Search Button */}
      <div style={{ background: '#fff', padding: '12px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <button
          onClick={handleBackToSearch}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Search
        </button>
      </div>

      {/* ── Progress Stepper ── */}
      <div className="progress-stepper-wrapper">
        <div className="progress-stepper">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.num;
            const isActive    = step === s.num;
            const isFlipping  = flippingStep === s.num;
            const isLast      = idx === STEPS.length - 1;

            return (
              <React.Fragment key={s.num}>
                <div 
                  className="progress-step" 
                  onClick={() => isCompleted && handleGoToStep(s.num)}
                  style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                >
                  {/* Flip card wrapper */}
                  <div className="progress-circle-perspective">
                    <div className={`progress-circle-inner ${isCompleted ? 'flipped' : ''} ${isFlipping ? 'flipping' : ''}`}>
                      {/* Front — number */}
                      <div className={`circle-face circle-front ${isActive || isFlipping ? 'face-active' : ''} ${!isCompleted && !isActive && !isFlipping ? 'face-inactive' : ''}`}>
                        {s.num}
                      </div>
                      {/* Back — checkmark */}
                      <div className="circle-face circle-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className={`progress-label ${isCompleted ? 'label-completed' : ''} ${isActive || isFlipping ? 'label-active' : ''} ${!isCompleted && !isActive && !isFlipping ? 'label-inactive' : ''}`}>
                    {s.label.split('\n').map((line, i, arr) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>

                {!isLast && (
                  <div className={`progress-connector ${isCompleted ? 'connector-completed' : 'connector-inactive'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      {step === 1  && <Step1  onNext={handleNext} pesoId={FIXED_PESO} />}
      {step === 2  && <Step2  onNext={handleNext} onPrev={handlePrev} />}
      {step === 3  && <Step3  onNext={handleNext} onPrev={handlePrev} />}
      {step === 4  && <Step4  onNext={handleNext} onPrev={handlePrev} />}
      {step === 5  && <Step5  onNext={handleNext} onPrev={handlePrev} />}
      {step === 6  && <Step6  onNext={handleNext} onPrev={handlePrev} />}
      {step === 7  && <Step7  onNext={handleNext} onPrev={handlePrev} />}
      {step === 8  && <Step8  onNext={handleNext} onPrev={handlePrev} />}
      {step === 9  && <Step9  onNext={handleNext} onPrev={handlePrev} />}
      {step === 10 && <Step10 onNext={handleNext} onPrev={handlePrev} />}
      {step === 11 && <Step11 onPrev={handlePrev} onSubmit={handleFormSubmit} pesoId={FIXED_PESO} />}
      </>
      )}

      {isOverviewOpen && (
        <OverviewModal 
          onClose={() => setIsOverviewOpen(false)} 
          onSubmitFinal={handleFormSubmit}
        />
      )}

      {showSuccessModal && (
        <SuccessModal onClose={handleSuccessModalClose} />
      )}

      {showBackConfirm && (
        <ConfirmModal
          message="Are you sure you want to go back to search? Any unsaved changes will be lost."
          onConfirm={confirmBackToSearch}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
    </div>
    </FormProvider>
  );
};

export default ApplicantForm;
