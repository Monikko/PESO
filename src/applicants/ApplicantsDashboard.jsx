import React, { useState } from 'react';
import './ApplicantForm.css';
import { supabase } from '../supabaseClient';
import occupationsData from '../data/occupations.json';
import coursesData from '../data/courses.json';
import licensesData from '../data/licenses.json';
import certificatesData from '../data/certificates.json';
import languagesData from '../data/languages.json';
import cityMunData from '../data/cityMunicipality.json';

const ITEMS_PER_PAGE = 10;
const WINDOW_SIZE = 10;

// Reusable paginated search modal (copied from Step4)
const SearchModal = ({ title, columns, data, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([...data]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);

  const handleSearch = () => {
    const lowerTerm = searchTerm.toLowerCase();
    const searchTerms = lowerTerm.split(/\s+/).filter(Boolean);
    const filtered = data.filter(row => {
      const fullText = columns.map(col => String(row[col.key] || '')).join(' ').toLowerCase();
      return searchTerms.every(term => fullText.includes(term));
    });
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
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
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
                  {columns.map(col => (
                    <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, idx) => (
                  <tr key={idx} onClick={() => onSelect(row)}>
                    {columns.map(col => (
                      <td key={col.key} className={col.blue ? 'text-blue' : ''}>{row[col.key]}</td>
                    ))}
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: '#888', padding: '15px' }}>No results found</td></tr>
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

// Column definitions
const OCCUPATION_COLUMNS = [
  { key: 'code', label: 'Code', width: '90px', blue: true },
  { key: 'occupation', label: 'Occupation', blue: true },
];

const COURSE_COLUMNS = [
  { key: 'name', label: 'Course/Major', blue: true },
];

const LICENSE_COLUMNS = [
  { key: 'license', label: 'License', blue: true },
];

const CERTIFICATE_COLUMNS = [
  { key: 'certificate', label: 'Certificate', blue: true },
];

const LANGUAGE_COLUMNS = [
  { key: 'name', label: 'Language/Dialect', blue: true },
];

const RESIDENCE_COLUMNS = [
  { key: 'code', label: 'Code', width: '80px', blue: true },
  { key: 'name', label: 'City/Municipality', blue: true },
  { key: 'province', label: 'Province' },
];

// Sorted data with safety checks
const sortedOccupations = [...occupationsData].sort((a, b) => 
  (a?.occupation || '').localeCompare(b?.occupation || '')
);
const sortedCourses = [...coursesData].sort((a, b) => 
  (a?.name || '').localeCompare(b?.name || '')
);
// Transform string arrays to objects
const sortedLicenses = [...licensesData].map((license, idx) => ({ 
  license, 
  id: idx 
})).sort((a, b) => a.license.localeCompare(b.license));

const sortedCertificates = [...certificatesData].map((certificate, idx) => ({ 
  certificate, 
  id: idx 
})).sort((a, b) => a.certificate.localeCompare(b.certificate));

const sortedLanguages = [...languagesData].sort((a, b) => 
  (a?.name || '').localeCompare(b?.name || '')
);
const sortedResidences = [...cityMunData].sort((a, b) => 
  (a?.name || '').localeCompare(b?.name || '')
);

const ApplicantsDashboard = ({ onAddNewApplicant, user, onLogout, onAdminAccess }) => {
  const [searchFilters, setSearchFilters] = useState({
    showRecordsOf: 'PESO',
    peso: 'PALAYAN CITY (NUEVA ECIJA)',
    firstName: '',
    middleName: '',
    lastName: '',
    registrationDateFrom: '',
    registrationDateTo: '',
    // Advanced search fields
    preferredPositionMajor: [],
    preferredPositionExact: [],
    highestEducation: 'ALL',
    courseMajor: [],
    license: [],
    eligibility: [],
    certification: [],
    languageDialect: [],
    residence: [],
    minWorkExperience: '',
    minimumAge: '',
    maximumAge: '',
    minimumHeight: '',
    gender: 'ALL',
    civilStatus: 'ALL',
    religion: 'ALL',
    disabilities: {
      visual: false,
      hearing: false,
      speech: false,
      physical: false,
      mental: false,
      others: false
    },
    skills: '',
    remarks: ''
  });

  // Handlers for adding selected items
  const handleSelectOccupationMajor = (occ) => {
    if (!searchFilters.preferredPositionMajor.find(o => o.code === occ.code)) {
      handleInputChange('preferredPositionMajor', [...searchFilters.preferredPositionMajor, occ]);
    }
    setShowOccupationMajorModal(false);
  };

  const handleSelectOccupationExact = (occ) => {
    if (!searchFilters.preferredPositionExact.find(o => o.code === occ.code)) {
      handleInputChange('preferredPositionExact', [...searchFilters.preferredPositionExact, occ]);
    }
    setShowOccupationExactModal(false);
  };

  const handleSelectCourse = (course) => {
    if (!searchFilters.courseMajor.includes(course.name)) {
      handleInputChange('courseMajor', [...searchFilters.courseMajor, course.name]);
    }
    setShowCourseModal(false);
  };

  const handleSelectLicense = (license) => {
    if (!searchFilters.license.includes(license.license)) {
      handleInputChange('license', [...searchFilters.license, license.license]);
    }
    setShowLicenseModal(false);
  };

  const handleSelectEligibility = (cert) => {
    if (!searchFilters.eligibility.includes(cert.certificate)) {
      handleInputChange('eligibility', [...searchFilters.eligibility, cert.certificate]);
    }
    setShowEligibilityModal(false);
  };

  const handleSelectCertification = (cert) => {
    if (!searchFilters.certification.includes(cert.certificate)) {
      handleInputChange('certification', [...searchFilters.certification, cert.certificate]);
    }
    setShowCertificationModal(false);
  };

  const handleSelectLanguage = (lang) => {
    if (!searchFilters.languageDialect.includes(lang.name)) {
      handleInputChange('languageDialect', [...searchFilters.languageDialect, lang.name]);
    }
    setShowLanguageModal(false);
  };

  const handleSelectResidence = (loc) => {
    const label = `${loc.name}, ${loc.province}`;
    if (!searchFilters.residence.includes(label)) {
      handleInputChange('residence', [...searchFilters.residence, label]);
    }
    setShowResidenceModal(false);
  };

  const removeItem = (field, index) => {
    const newArray = [...searchFilters[field]];
    newArray.splice(index, 1);
    handleInputChange(field, newArray);
  };

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal states
  const [showOccupationMajorModal, setShowOccupationMajorModal] = useState(false);
  const [showOccupationExactModal, setShowOccupationExactModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null); // 'from' or 'to'

  const pesoOptions = [
    'PALAYAN CITY (NUEVA ECIJA)',
    'CABANATUAN CITY (NUEVA ECIJA)',
    'GAPAN CITY (NUEVA ECIJA)',
    'SAN JOSE CITY (NUEVA ECIJA)',
    'SCIENCE CITY OF MUÑOZ (NUEVA ECIJA)',
    'ALIAGA (NUEVA ECIJA)',
    'BONGABON (NUEVA ECIJA)',
    'CABIAO (NUEVA ECIJA)',
    'CARRANGLAN (NUEVA ECIJA)',
    'CUYAPO (NUEVA ECIJA)',
    'GABALDON (NUEVA ECIJA)',
    'GENERAL MAMERTO NATIVIDAD (NUEVA ECIJA)',
    'GENERAL TINIO (NUEVA ECIJA)',
    'GUIMBA (NUEVA ECIJA)',
    'JAEN (NUEVA ECIJA)',
    'LAUR (NUEVA ECIJA)',
    'LICAB (NUEVA ECIJA)',
    'LLANERA (NUEVA ECIJA)',
    'LUPAO (NUEVA ECIJA)',
    'NAMPICUAN (NUEVA ECIJA)',
    'PANTABANGAN (NUEVA ECIJA)',
    'PEÑARANDA (NUEVA ECIJA)',
    'QUEZON (NUEVA ECIJA)',
    'RIZAL (NUEVA ECIJA)',
    'SAN ANTONIO (NUEVA ECIJA)',
    'SAN ISIDRO (NUEVA ECIJA)',
    'SAN LEONARDO (NUEVA ECIJA)',
    'SANTA ROSA (NUEVA ECIJA)',
    'SANTO DOMINGO (NUEVA ECIJA)',
    'TALAVERA (NUEVA ECIJA)',
    'TALUGTUG (NUEVA ECIJA)',
    'ZARAGOZA (NUEVA ECIJA)'
  ];

  const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  // Format date input as user types (mm/dd/yyyy)
  const formatDateInput = (value) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits (mmddyyyy)
    const limited = numbers.slice(0, 8);
    
    // Extract parts
    let month = limited.slice(0, 2);
    let day = limited.slice(2, 4);
    let year = limited.slice(4, 8);
    
    // Validate and limit month (01-12)
    if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum > 12) {
        month = '12';
      } else if (monthNum === 0) {
        month = '01';
      }
    } else if (month.length === 1) {
      const monthNum = parseInt(month);
      if (monthNum > 1) {
        // If first digit > 1, auto-pad (e.g., 2 becomes 02)
        month = '0' + month;
      }
    }
    
    // Validate and limit day (01-31)
    if (day.length === 2) {
      const dayNum = parseInt(day);
      if (dayNum > 31) {
        day = '31';
      } else if (dayNum === 0) {
        day = '01';
      }
    } else if (day.length === 1) {
      const dayNum = parseInt(day);
      if (dayNum > 3) {
        // If first digit > 3, auto-pad (e.g., 4 becomes 04)
        day = '0' + day;
      }
    }
    
    // Build formatted string
    let formatted = month;
    if (limited.length >= 2) {
      formatted = month + '/' + day;
    }
    if (limited.length >= 4) {
      formatted = month + '/' + day + '/' + year;
    }
    
    return formatted;
  };

  const handleDateInputChange = (field, value) => {
    const formatted = formatDateInput(value);
    handleInputChange(field, formatted);
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Build the query
      let query = supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by first name (case-insensitive partial match)
      if (searchFilters.firstName.trim()) {
        query = query.ilike('first_name', `%${searchFilters.firstName.trim()}%`);
      }

      // Filter by middle name
      if (searchFilters.middleName.trim()) {
        query = query.ilike('middle_name', `%${searchFilters.middleName.trim()}%`);
      }

      // Filter by last name
      if (searchFilters.lastName.trim()) {
        query = query.ilike('surname', `%${searchFilters.lastName.trim()}%`);
      }

      // Filter by registration date range
      if (searchFilters.registrationDateFrom) {
        query = query.gte('created_at', searchFilters.registrationDateFrom);
      }
      if (searchFilters.registrationDateTo) {
        query = query.lte('created_at', searchFilters.registrationDateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        alert(`Error searching applicants: ${error.message}`);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`An unexpected error occurred: ${err.message}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTransaction = () => {
    alert('Add new transaction functionality will be implemented here');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '20px 40px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333' }}>Applicants Database</h1>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
            <a href="#" style={{ color: '#337ab7', textDecoration: 'none' }}>Home</a>
            <span style={{ margin: '0 8px', color: '#ccc' }}>›</span>
            <span>Applicants</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user?.email ? (
            <>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Logged in as</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  padding: '8px 20px',
                  background: '#d9534f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#c9302c'}
                onMouseLeave={(e) => e.target.style.background = '#d9534f'}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onAdminAccess}
              style={{
                padding: '8px 20px',
                background: '#337ab7',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#286090'}
              onMouseLeave={(e) => e.target.style.background = '#337ab7'}
            >
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Search Card */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '4px' }}>
        
        {/* Show records of */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            Show records of
          </label>
          <select
            value={searchFilters.showRecordsOf}
            onChange={(e) => handleInputChange('showRecordsOf', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              background: '#fff'
            }}
          >
            <option value="PESO">PESO</option>
          </select>
        </div>

        {/* PESO - Fixed to Palayan City */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            PESO
          </label>
          <select
            value="PALAYAN CITY (NUEVA ECIJA)"
            disabled
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem',
              background: '#f5f5f5',
              color: '#333',
              cursor: 'not-allowed'
            }}
          >
            <option value="PALAYAN CITY (NUEVA ECIJA)">PALAYAN CITY (NUEVA ECIJA)</option>
          </select>
        </div>

        {/* First name */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            First name
          </label>
          <input
            type="text"
            value={searchFilters.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Middle name */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            Middle name
          </label>
          <input
            type="text"
            value={searchFilters.middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Last name */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            Last name
          </label>
          <input
            type="text"
            value={searchFilters.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Registration date */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
          <label style={{ minWidth: '160px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
            Registration date
          </label>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={searchFilters.registrationDateFrom}
              onChange={(e) => handleDateInputChange('registrationDateFrom', e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.95rem'
              }}
            />
            <span style={{ color: '#666' }}>to</span>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={searchFilters.registrationDateTo}
              onChange={(e) => handleDateInputChange('registrationDateTo', e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.95rem'
              }}
            />
            <button
              type="button"
              onClick={() => {
                setDatePickerField('both');
                setShowDatePickerModal(true);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#f8f9fa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced search toggle */}
        <div style={{ marginBottom: '20px', paddingLeft: '180px' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none',
              border: 'none',
              color: '#337ab7',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            Advanced search
          </button>
        </div>

        {/* Advanced Search Fields */}
        {showAdvanced && (
          <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
            
            {/* Preferred position (Major grouping) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Preferred position (Major grouping)
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.preferredPositionMajor.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.preferredPositionMajor.map((occ, idx) => (
                      <span key={idx} className="occupation-tag">
                        {occ.occupation}
                        <button className="remove-tag-btn" onClick={() => removeItem('preferredPositionMajor', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowOccupationMajorModal(true)}
                  style={{ padding: '6px 16px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Preferred position (Exact title) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Preferred position (Exact title)
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.preferredPositionExact.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.preferredPositionExact.map((occ, idx) => (
                      <span key={idx} className="occupation-tag">
                        {occ.occupation}
                        <button className="remove-tag-btn" onClick={() => removeItem('preferredPositionExact', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowOccupationExactModal(true)}
                  style={{ padding: '6px 16px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Highest educational attainment */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Highest educational attainment
              </label>
              <select
                value={searchFilters.highestEducation}
                onChange={(e) => handleInputChange('highestEducation', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="ALL">ALL</option>
                <option value="ELEMENTARY">ELEMENTARY</option>
                <option value="HIGH SCHOOL">HIGH SCHOOL</option>
                <option value="SENIOR HIGH SCHOOL">SENIOR HIGH SCHOOL</option>
                <option value="VOCATIONAL">VOCATIONAL</option>
                <option value="COLLEGE">COLLEGE</option>
                <option value="POST GRADUATE">POST GRADUATE</option>
              </select>
            </div>

            {/* Course/major */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Course/major
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.courseMajor.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.courseMajor.map((course, idx) => (
                      <span key={idx} className="occupation-tag">
                        {course}
                        <button className="remove-tag-btn" onClick={() => removeItem('courseMajor', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowCourseModal(true)}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#5cb85c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* License */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                License
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.license.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.license.map((license, idx) => (
                      <span key={idx} className="occupation-tag">
                        {license}
                        <button className="remove-tag-btn" onClick={() => removeItem('license', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowLicenseModal(true)}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#5cb85c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Eligibility */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Eligibility
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.eligibility.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.eligibility.map((elig, idx) => (
                      <span key={idx} className="occupation-tag">
                        {elig}
                        <button className="remove-tag-btn" onClick={() => removeItem('eligibility', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowEligibilityModal(true)}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#5cb85c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Certification */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Certification
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.certification.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.certification.map((cert, idx) => (
                      <span key={idx} className="occupation-tag">
                        {cert}
                        <button className="remove-tag-btn" onClick={() => removeItem('certification', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowCertificationModal(true)}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#5cb85c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Language/dialect spoken */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Language/dialect spoken
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.languageDialect.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.languageDialect.map((lang, idx) => (
                      <span key={idx} className="occupation-tag">
                        {lang}
                        <button className="remove-tag-btn" onClick={() => removeItem('languageDialect', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowLanguageModal(true)}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#5cb85c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Residence */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Residence
              </label>
              <div style={{ flex: 1 }}>
                {searchFilters.residence.length > 0 && (
                  <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {searchFilters.residence.map((res, idx) => (
                      <span key={idx} className="occupation-tag">
                        {res}
                        <button className="remove-tag-btn" onClick={() => removeItem('residence', idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setShowResidenceModal(true)}
                  style={{ padding: '6px 16px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span> Add
                </button>
              </div>
            </div>

            {/* Min. work experience */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Min. work experience
              </label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={searchFilters.minWorkExperience}
                  onChange={(e) => handleInputChange('minWorkExperience', e.target.value)}
                  style={{ width: '120px', padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <span style={{ color: '#666', fontSize: '0.9rem' }}>months</span>
              </div>
            </div>

            {/* Minimum age */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Minimum age
              </label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={searchFilters.minimumAge}
                  onChange={(e) => handleInputChange('minimumAge', e.target.value)}
                  style={{ width: '120px', padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <span style={{ color: '#666', fontSize: '0.9rem' }}>yrs old</span>
              </div>
            </div>

            {/* Maximum age */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Maximum age
              </label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={searchFilters.maximumAge}
                  onChange={(e) => handleInputChange('maximumAge', e.target.value)}
                  style={{ width: '120px', padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <span style={{ color: '#666', fontSize: '0.9rem' }}>yrs old</span>
              </div>
            </div>

            {/* Minimum height */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Minimum height
              </label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={searchFilters.minimumHeight}
                  onChange={(e) => handleInputChange('minimumHeight', e.target.value)}
                  style={{ width: '120px', padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <span style={{ color: '#666', fontSize: '0.9rem' }}>cm</span>
              </div>
            </div>

            {/* Gender */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Gender
              </label>
              <select
                value={searchFilters.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="ALL">ALL</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            {/* Civil status */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Civil status
              </label>
              <select
                value={searchFilters.civilStatus}
                onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="ALL">ALL</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>

            {/* Religion */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Religion
              </label>
              <select
                value={searchFilters.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="ALL">ALL</option>
                <option value="TWELVE TRIBES OF ISRAEL">TWELVE TRIBES OF ISRAEL</option>
                <option value="ASSEMBLY OF GOD">ASSEMBLY OF GOD</option>
                <option value="AGLIPAYAN">AGLIPAYAN</option>
                <option value="BORN AGAIN CHRISTIAN">BORN AGAIN CHRISTIAN</option>
                <option value="BAPTIST">BAPTIST</option>
                <option value="BUDDIST">BUDDIST</option>
                <option value="CHURCH OF GOD THRU CHRIST JESUS">CHURCH OF GOD THRU CHRIST JESUS</option>
                <option value="CHRISTIAN">CHRISTIAN</option>
                <option value="CHURCH OF CHRIST">CHURCH OF CHRIST</option>
                <option value="CHURCH OF GOD">CHURCH OF GOD</option>
                <option value="EPISCOPALIAN ANGELICAN">EPISCOPALIAN ANGELICAN</option>
                <option value="ESPIRITISM">ESPIRITISM</option>
                <option value="EVANGELICAL">EVANGELICAL</option>
                <option value="FOUR SQUARE GOSPEL CHURCH">FOUR SQUARE GOSPEL CHURCH</option>
                <option value="FAITH TABERNACLE">FAITH TABERNACLE</option>
                <option value="HINDU">HINDU</option>
                <option value="IGLESIA SA DIYOS ESPIRITU SANTO">IGLESIA SA DIYOS ESPIRITU SANTO</option>
                <option value="IGLESIA NI CRISTO">IGLESIA NI CRISTO</option>
                <option value="IGLESIA NG DIYOS KAY CRISTO JESUS">IGLESIA NG DIYOS KAY CRISTO JESUS</option>
                <option value="ISLAM">ISLAM</option>
                <option value="JESUS MIRACLE CRUSADE">JESUS MIRACLE CRUSADE</option>
                <option value="JEHOVAH'S WITNESSES">JEHOVAH'S WITNESSES</option>
                <option value="LUTHERAN">LUTHERAN</option>
                <option value="METHODIST">METHODIST</option>
                <option value="CHURCH OF LATTER DAY SAINT">CHURCH OF LATTER DAY SAINT</option>
                <option value="NON-SECTORAL CHARISMATIC">NON-SECTORAL CHARISMATIC</option>
                <option value="ORTHODOX">ORTHODOX</option>
                <option value="OTHERS">OTHERS</option>
                <option value="PENTECOSTAL">PENTECOSTAL</option>
                <option value="PHILIPPINE INDEPENDENT CHRISTIAN CHURCH(PICC/IFI)">PHILIPPINE INDEPENDENT CHRISTIAN CHURCH(PICC/IFI)</option>
                <option value="FOURTH WATCH">FOURTH WATCH</option>
                <option value="PRESBYTERIAN">PRESBYTERIAN</option>
                <option value="PROTESTANT">PROTESTANT</option>
                <option value="ROMAN CATHOLIC">ROMAN CATHOLIC</option>
                <option value="RIZALIST">RIZALIST</option>
                <option value="SEVENTH DAY ADVENTIST">SEVENTH DAY ADVENTIST</option>
                <option value="UNITED CHURCH CHRISTIAN OF THE PHILIPPINES (UCCP)">UNITED CHURCH CHRISTIAN OF THE PHILIPPINES (UCCP)</option>
                <option value="UNION ESPIRITISTA CRISTIANA">UNION ESPIRITISTA CRISTIANA</option>
                <option value="WESLEYAN CHURCH">WESLEYAN CHURCH</option>
                <option value="WORD OF HOPE">WORD OF HOPE</option>
              </select>
            </div>

            {/* Type of disability */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem', paddingTop: '4px' }}>
                Type of disability
              </label>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['visual', 'hearing', 'speech', 'physical', 'mental', 'others'].map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={searchFilters.disabilities[type]}
                      onChange={(e) => handleInputChange('disabilities', { ...searchFilters.disabilities, [type]: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ textTransform: 'capitalize', color: '#333' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Skills
              </label>
              <input
                type="text"
                value={searchFilters.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Remarks */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0', gap: '20px' }}>
              <label style={{ minWidth: '220px', textAlign: 'right', fontWeight: 600, color: '#333', fontSize: '0.9rem', paddingTop: '8px' }}>
                Remarks
              </label>
              <textarea
                value={searchFilters.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                style={{ flex: 1, padding: '7px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical' }}
              />
            </div>

          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', paddingLeft: '180px' }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: loading ? '#ccc' : '#5bc0de',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={onAddNewApplicant}
            style={{
              padding: '10px 24px',
              background: '#5cb85c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Add new applicant
          </button>
          <button
            onClick={handleAddNewTransaction}
            style={{
              padding: '10px 24px',
              background: '#f0ad4e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Add new transaction
          </button>
        </div>

      </div>

      {/* Results */}
      <div style={{ maxWidth: '1000px', margin: '20px auto', background: '#fff', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '4px' }}>
        {loading ? (
          <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', textAlign: 'center' }}>
            Searching...
          </p>
        ) : !hasSearched ? (
          <p style={{ margin: 0, color: '#999', fontSize: '0.95rem', textAlign: 'center', fontStyle: 'italic' }}>
            Enter search criteria and click "Search" to find applicants
          </p>
        ) : searchResults.length === 0 ? (
          <p style={{ margin: 0, color: '#999', fontSize: '0.95rem', textAlign: 'center', fontStyle: 'italic' }}>
            No applicants found matching your search criteria
          </p>
        ) : (
          <>
            <div style={{ marginBottom: '20px', padding: '12px', background: '#e7f3ff', borderLeft: '4px solid #337ab7', borderRadius: '4px' }}>
              <strong style={{ color: '#337ab7' }}>Found {searchResults.length} applicant{searchResults.length !== 1 ? 's' : ''}</strong>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Sex</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Date of Birth</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Contact</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((applicant, idx) => (
                    <tr key={applicant.id} style={{ borderBottom: '1px solid #e9ecef', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '12px', color: '#333' }}>
                        <div style={{ fontWeight: 600 }}>{applicant.first_name} {applicant.middle_name} {applicant.surname}</div>
                        {applicant.email && <div style={{ fontSize: '0.85rem', color: '#666' }}>{applicant.email}</div>}
                      </td>
                      <td style={{ padding: '12px', color: '#666', textTransform: 'uppercase' }}>{applicant.sex || '—'}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{applicant.date_of_birth || '—'}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{applicant.contact_number || '—'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          background: applicant.status === 'pending' ? '#fff3cd' : applicant.status === 'approved' ? '#d4edda' : '#f8d7da',
                          color: applicant.status === 'pending' ? '#856404' : applicant.status === 'approved' ? '#155724' : '#721c24',
                          textTransform: 'uppercase'
                        }}>
                          {applicant.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>
                        {applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showOccupationMajorModal && (
        <SearchModal
          title="Select preferred occupation (Major grouping)"
          columns={OCCUPATION_COLUMNS}
          data={sortedOccupations}
          onClose={() => setShowOccupationMajorModal(false)}
          onSelect={handleSelectOccupationMajor}
        />
      )}

      {showOccupationExactModal && (
        <SearchModal
          title="Select preferred occupation (Exact title)"
          columns={OCCUPATION_COLUMNS}
          data={sortedOccupations}
          onClose={() => setShowOccupationExactModal(false)}
          onSelect={handleSelectOccupationExact}
        />
      )}

      {showCourseModal && (
        <SearchModal
          title="Select course/major"
          columns={COURSE_COLUMNS}
          data={sortedCourses}
          onClose={() => setShowCourseModal(false)}
          onSelect={handleSelectCourse}
        />
      )}

      {showLicenseModal && (
        <SearchModal
          title="Select license"
          columns={LICENSE_COLUMNS}
          data={sortedLicenses}
          onClose={() => setShowLicenseModal(false)}
          onSelect={handleSelectLicense}
        />
      )}

      {showEligibilityModal && (
        <SearchModal
          title="Select eligibility"
          columns={CERTIFICATE_COLUMNS}
          data={sortedCertificates}
          onClose={() => setShowEligibilityModal(false)}
          onSelect={handleSelectEligibility}
        />
      )}

      {showCertificationModal && (
        <SearchModal
          title="Select certification"
          columns={CERTIFICATE_COLUMNS}
          data={sortedCertificates}
          onClose={() => setShowCertificationModal(false)}
          onSelect={handleSelectCertification}
        />
      )}

      {showLanguageModal && (
        <SearchModal
          title="Select language/dialect"
          columns={LANGUAGE_COLUMNS}
          data={sortedLanguages}
          onClose={() => setShowLanguageModal(false)}
          onSelect={handleSelectLanguage}
        />
      )}

      {showResidenceModal && (
        <SearchModal
          title="Select residence (City/Municipality)"
          columns={RESIDENCE_COLUMNS}
          data={sortedResidences}
          onClose={() => setShowResidenceModal(false)}
          onSelect={handleSelectResidence}
        />
      )}

      {/* Date Picker Modal */}
      {showDatePickerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Select Registration Date</h3>
              <button className="close-btn" onClick={() => setShowDatePickerModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>From Date</label>
                <input
                  type="date"
                  value={searchFilters.registrationDateFrom}
                  onChange={(e) => handleInputChange('registrationDateFrom', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>To Date</label>
                <input
                  type="date"
                  value={searchFilters.registrationDateTo}
                  onChange={(e) => handleInputChange('registrationDateTo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDatePickerModal(false)}
                  style={{
                    padding: '8px 20px',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDatePickerModal(false)}
                  style={{
                    padding: '8px 20px',
                    background: '#428bca',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsDashboard;
