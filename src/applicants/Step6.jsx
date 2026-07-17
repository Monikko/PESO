import React, { useState } from 'react';
import './ApplicantForm.css';
import schoolsData from '../data/schools.json';
import coursesData from '../data/courses.json';
import { useFormContext } from './FormContext';

const ITEMS_PER_PAGE = 10;
const WINDOW_SIZE = 10;

const EDUCATION_LEVELS = [
  'GRADE I',
  'GRADE II',
  'GRADE III',
  'GRADE IV',
  'GRADE V',
  'GRADE VI',
  'GRADE VII',
  'GRADE VIII',
  'ELEMENTARY GRADUATE',
  '1ST YEAR HIGH SCHOOL/GRADE VII (FOR K TO 12)',
  '2ND YEAR HIGH SCHOOL/GRADE VIII (FOR K TO 12)',
  '3RD YEAR HIGH SCHOOL/GRADE IX (FOR K TO 12)',
  '4TH YEAR HIGH SCHOOL/GRADE X (FOR K TO 12)',
  'GRADE XI (FOR K TO 12)',
  'GRADE XII (FOR K TO 12)',
  'HIGH SCHOOL GRADUATE',
  'VOCATIONAL UNDERGRADUATE',
  'VOCATIONAL GRADUATE',
  '1ST YEAR COLLEGE LEVEL',
  '2ND YEAR COLLEGE LEVEL',
  '3RD YEAR COLLEGE LEVEL',
  '4TH YEAR COLLEGE LEVEL',
  '5TH YEAR COLLEGE LEVEL',
  'COLLEGE GRADUATE',
  'MASTERAL/POST GRADUATE LEVEL',
  'MASTERAL/POST GRADUATE',
  'SECONDARY (NON K-12)',
  'SECONDARY (K-12)',
];

const sortedSchools = [...schoolsData].sort((a, b) => a.name.localeCompare(b.name));

const SchoolModal = ({ onClose, onSelect, educationLevel }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Pre-filter schools based on selected education level
  const filteredByLevel = React.useMemo(() => {
    if (!educationLevel) return sortedSchools;

    const isElementary = ['GRADE I', 'GRADE II', 'GRADE III', 'GRADE IV', 'GRADE V', 'GRADE VI', 'ELEMENTARY GRADUATE'].includes(educationLevel);
    const isHighSchool = educationLevel.includes('HIGH SCHOOL') || educationLevel.includes('SECONDARY') || educationLevel.includes('GRADE VII') || educationLevel.includes('GRADE VIII') || educationLevel.includes('GRADE IX') || educationLevel.includes('GRADE X') || educationLevel.includes('GRADE XI') || educationLevel.includes('GRADE XII');
    const isCollege = educationLevel.includes('COLLEGE') || educationLevel.includes('VOCATIONAL') || educationLevel.includes('MASTERAL') || educationLevel.includes('POST GRADUATE');

    return sortedSchools.filter(s => {
      const name = s.name.toUpperCase();
      if (isElementary) {
        return name.includes('ELEMENTARY') || name.includes('CENTRAL SCHOOL');
      }
      if (isHighSchool) {
        return name.includes('HIGH SCHOOL') || name.includes('ACADEMY');
      }
      if (isCollege) {
        return name.includes('UNIVERSITY') || name.includes('COLLEGE') || name.includes('INSTITUTE') || name.includes('FOUNDATION') || name.includes('STATE');
      }
      return true; // if no specific filter hit, return all
    });
  }, [educationLevel]);

  const [results, setResults] = useState(filteredByLevel);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);

  const handleSearch = () => {
    const lowerTerm = searchTerm.trim().toLowerCase();
    const filtered = lowerTerm
      ? filteredByLevel.filter(s =>
          s.code.toLowerCase().includes(lowerTerm) ||
          s.name.toLowerCase().includes(lowerTerm) ||
          s.city.toLowerCase().includes(lowerTerm)
        )
      : filteredByLevel;
    setResults(filtered);
    setCurrentPage(1);
    setPageWindowStart(1);
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginated = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const windowEnd = Math.min(pageWindowStart + WINDOW_SIZE - 1, totalPages);
  const hasMore = windowEnd < totalPages;

  const handleEllipsisClick = () => {
    const next = pageWindowStart + WINDOW_SIZE;
    setPageWindowStart(next);
    setCurrentPage(next);
  };

  const handlePrevWindow = () => {
    const prev = Math.max(1, pageWindowStart - WINDOW_SIZE);
    setPageWindowStart(prev);
    setCurrentPage(prev);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Select school/university</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              autoFocus
            />
            <button className="search-action-btn" onClick={handleSearch}>Search</button>
          </div>

          <div className="table-container">
            <table className="search-results-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Code</th>
                  <th>School/University</th>
                  <th style={{ width: '130px' }}>City/Municipality</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((school, idx) => (
                  <tr key={idx} onClick={() => onSelect(school)}>
                    <td className="text-blue">{school.code}</td>
                    <td className="text-blue">{school.name}</td>
                    <td>{school.city}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: '15px' }}>
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {pageWindowStart > 1 && (
                  <button className="page-btn" onClick={handlePrevWindow} title="Previous 10 pages">«</button>
                )}
                {Array.from({ length: windowEnd - pageWindowStart + 1 }, (_, i) => pageWindowStart + i).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                {hasMore && (
                  <button className="page-btn page-ellipsis-btn" onClick={handleEllipsisClick} title="Next 10 pages">...</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseModal = ({ onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  // Use the exact levels from the screenshot
  const levels = [
    "Elementary",
    "High School",
    "Vocational",
    "Programs",
    "College",
    "Post-Graduate"
  ];

  const filteredData = React.useMemo(() => {
    let filtered = coursesData;
    if (selectedLevel) {
      filtered = filtered.filter(c => c.level === selectedLevel);
    }
    const lowerTerm = searchTerm.trim().toLowerCase();
    if (lowerTerm) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(lowerTerm) ||
        c.name.toLowerCase().includes(lowerTerm)
      );
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedLevel]);

  const [results, setResults] = useState(filteredData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);

  React.useEffect(() => {
    setResults(filteredData);
    setCurrentPage(1);
    setPageWindowStart(1);
  }, [filteredData]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginated = results.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const windowEnd = Math.min(pageWindowStart + WINDOW_SIZE - 1, totalPages);
  const hasMore = windowEnd < totalPages;

  const handleEllipsisClick = () => {
    const next = pageWindowStart + WINDOW_SIZE;
    setPageWindowStart(next);
    setCurrentPage(next);
  };

  const handlePrevWindow = () => {
    const prev = Math.max(1, pageWindowStart - WINDOW_SIZE);
    setPageWindowStart(prev);
    setCurrentPage(prev);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Select level/program</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="search-bar" style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{ width: '150px', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">All levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{ flex: 1 }}
            />
            <button className="search-action-btn">Search</button>
          </div>

          <div className="table-container">
            <table className="search-results-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Code</th>
                  <th>Course/Program</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((course, idx) => (
                  <tr key={idx} onClick={() => onSelect(course)}>
                    <td className="text-blue">{course.code}</td>
                    <td className="text-blue">{course.name}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: '#888', padding: '15px' }}>
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {pageWindowStart > 1 && (
                  <button className="page-btn" onClick={handlePrevWindow} title="Previous 10 pages">«</button>
                )}
                {Array.from({ length: windowEnd - pageWindowStart + 1 }, (_, i) => pageWindowStart + i).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                {hasMore && (
                  <button className="page-btn page-ellipsis-btn" onClick={handleEllipsisClick} title="Next 10 pages">...</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  educationLevel: '',
  school: '',
  schoolCode: '',
  course: '',
  yearGraduated: '',
  awards: '',
};

const EducationModal = ({ onSave, onCancel, initialData }) => {
  const [form, setForm] = useState(initialData ? { ...initialData } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  
  const [isManualSchool, setIsManualSchool] = useState(false);
  const [manualSchool, setManualSchool] = useState('');
  
  const [isManualCourse, setIsManualCourse] = useState(false);
  const [manualCourse, setManualCourse] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectSchool = (school) => {
    setForm(prev => ({ ...prev, school: school.name, schoolCode: school.code }));
    if (errors.school) setErrors(prev => ({ ...prev, school: '' }));
    setShowSchoolModal(false);
  };

  const handleSelectCourse = (course) => {
    setForm(prev => ({ ...prev, course: course.name }));
    setShowCourseModal(false);
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.educationLevel) newErrors.educationLevel = 'Please select an education level.';
    if (!form.school.trim()) newErrors.school = 'Please enter or select a school.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ ...form });
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '520px' }}>
          <div className="modal-header">
            <h3>{initialData ? 'Edit record' : 'Add new record'}</h3>
            <button className="close-btn" onClick={onCancel}>×</button>
          </div>
          <div className="modal-body">
            {/* Education Level */}
            <div className="edu-form-row">
              <label className="edu-form-label">Education level</label>
              <div className="edu-form-control">
                <select
                  className="edu-select"
                  value={form.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                >
                  <option value="">SELECT</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.educationLevel && <span className="edu-error">{errors.educationLevel}</span>}
              </div>
            </div>

            {/* School */}
            <div className="edu-form-row">
              <label className="edu-form-label">School</label>
              <div className="edu-form-control">
                <div className="input-with-button">
                  <input
                    type="text"
                    className="input-field"
                    value={form.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    onClick={() => setShowSchoolModal(true)}
                    readOnly
                    placeholder="Click to search school"
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    className="icon-btn search-btn"
                    title="Search school"
                    onClick={() => setShowSchoolModal(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="22" y2="22" />
                    </svg>
                  </button>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', color: '#555' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '6px' }}
                      checked={isManualSchool}
                      onChange={(e) => setIsManualSchool(e.target.checked)}
                    />
                    Not in the list? Enter school manually
                  </label>
                </div>

                {isManualSchool && (
                  <div className="manual-input-wrapper" style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type your school"
                      value={manualSchool}
                      onChange={(e) => setManualSchool(e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') { 
                          handleChange('school', manualSchool); 
                          handleChange('schoolCode', 'MANUAL'); 
                          setIsManualSchool(false); 
                        } 
                      }}
                    />
                    <button 
                      className="add-manual-btn" 
                      onClick={() => { 
                        handleChange('school', manualSchool); 
                        handleChange('schoolCode', 'MANUAL'); 
                        setIsManualSchool(false); 
                      }}
                    >
                      Use
                    </button>
                  </div>
                )}

                {errors.school && <span className="edu-error">{errors.school}</span>}
              </div>
            </div>

            {/* Course */}
            <div className="edu-form-row">
              <label className="edu-form-label">Course</label>
              <div className="edu-form-control">
                <div className="input-with-button">
                  <input
                    type="text"
                    className="input-field"
                    value={form.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    onClick={() => setShowCourseModal(true)}
                    readOnly
                    placeholder="Click to search course"
                    style={{ cursor: 'pointer' }}
                  />
                  <button 
                    className="icon-btn search-btn" 
                    title="Search course"
                    onClick={() => setShowCourseModal(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="22" y2="22" />
                    </svg>
                  </button>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', color: '#555' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '6px' }}
                      checked={isManualCourse}
                      onChange={(e) => setIsManualCourse(e.target.checked)}
                    />
                    Not in the list? Enter course manually
                  </label>
                </div>

                {isManualCourse && (
                  <div className="manual-input-wrapper" style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type your course"
                      value={manualCourse}
                      onChange={(e) => setManualCourse(e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') { 
                          handleChange('course', manualCourse); 
                          setIsManualCourse(false); 
                        } 
                      }}
                    />
                    <button 
                      className="add-manual-btn" 
                      onClick={() => { 
                        handleChange('course', manualCourse); 
                        setIsManualCourse(false); 
                      }}
                    >
                      Use
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Year Graduated */}
            <div className="edu-form-row">
              <label className="edu-form-label">Year graduated</label>
              <div className="edu-form-control edu-year-row">
                <input
                  type="text"
                  className="input-field edu-year-input"
                  placeholder="yyyy"
                  maxLength={4}
                  value={form.yearGraduated}
                  onChange={(e) => handleChange('yearGraduated', e.target.value.replace(/\D/g, ''))}
                />
                <span className="edu-year-hint">(or year last attended)</span>
              </div>
            </div>

            {/* Awards */}
            <div className="edu-form-row">
              <label className="edu-form-label">Awards</label>
              <div className="edu-form-control">
                <input
                  type="text"
                  className="input-field"
                  value={form.awards}
                  onChange={(e) => handleChange('awards', e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="edu-modal-actions">
              <button className="edu-save-btn" onClick={handleSave}>Save</button>
              <button className="edu-cancel-btn" onClick={onCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>

      {/* School Search Modal — rendered on top */}
      {showSchoolModal && (
        <SchoolModal
          onClose={() => setShowSchoolModal(false)}
          onSelect={handleSelectSchool}
          educationLevel={form.educationLevel}
        />
      )}

      {/* Course Search Modal */}
      {showCourseModal && (
        <CourseModal
          onClose={() => setShowCourseModal(false)}
          onSelect={handleSelectCourse}
        />
      )}
    </>
  );
};

const Step6 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step6 || {};

  const [records, setRecords] = useState(initialData.records || []);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const saveStepData = () => {
    updateFormData({
      step6: {
        records
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

  const handleSave = (record) => {
    if (editIndex !== null) {
      setRecords(prev => {
        const copy = [...prev];
        copy[editIndex] = record;
        return copy;
      });
      setEditIndex(null);
    } else {
      setRecords(prev => [...prev, record]);
    }
    setShowModal(false);
  };

  const editRecord = (idx) => {
    setEditIndex(idx);
    setShowModal(true);
  };

  const removeRecord = (index) => {
    setRecords(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>EDUCATIONAL BACKGROUND</h2>
          <span className="step-indicator">Step 6 of 11</span>
        </div>

        <div className="form-body preferences-body">
          <div className="preference-section" style={{ borderBottom: 'none' }}>

            {records.length > 0 && (
              <div className="edu-records-table-wrapper">
                <table className="edu-records-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Level</th>
                      <th style={{ textAlign: 'center' }}>School</th>
                      <th style={{ textAlign: 'center' }}>Course</th>
                      <th style={{ textAlign: 'center', width: '80px' }}>Year Grad.</th>
                      <th style={{ textAlign: 'center', width: '50px' }}>Edit</th>
                      <th style={{ textAlign: 'center', width: '50px' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, idx) => (
                      <tr key={idx} style={{ textTransform: 'uppercase' }}>
                        <td>{rec.educationLevel}</td>
                        <td>{rec.school}</td>
                        <td>{rec.course}</td>
                        <td style={{ textAlign: 'center' }}>{rec.yearGraduated}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="icon-btn edit-btn"
                            title="Edit"
                            onClick={() => editRecord(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="icon-btn delete-btn"
                            title="Delete"
                            onClick={() => removeRecord(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="add-btn" onClick={() => { setEditIndex(null); setShowModal(true); }}>
              + Add education
            </button>

          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {showModal && (
        <EducationModal
          onSave={handleSave}
          onCancel={() => { setShowModal(false); setEditIndex(null); }}
          initialData={editIndex !== null ? records[editIndex] : null}
        />
      )}
    </div>
  );
};

export default Step6;
