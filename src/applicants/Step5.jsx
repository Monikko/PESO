import React, { useState } from 'react';
import './ApplicantForm.css';
import languagesData from '../data/languages.json';
import { useFormContext } from './FormContext';

const ITEMS_PER_PAGE = 10;
const WINDOW_SIZE = 10;

const LANGUAGE_COLUMNS = [
  { key: 'code', label: 'Code', width: '80px', blue: true },
  { key: 'name', label: 'Language', blue: true },
  { key: 'type', label: 'Type', width: '120px', blue: false },
];

// The 3 most common languages shown by default
const TOP_CODES = ['L038', 'L086', 'L128'];
const topLanguagesRaw = TOP_CODES.map(code => languagesData.find(l => l.code === code));

// Full sorted list (top 3 first, then alphabetical)
const sortedLanguages = [
  ...topLanguagesRaw,
  ...languagesData.filter(l => !TOP_CODES.includes(l.code)).sort((a, b) =>
    a.name.localeCompare(b.name)
  ),
];

// Function to determine language type
const getLanguageType = (langName) => {
  const name = langName.toUpperCase();
  
  // Major International Languages
  if (['ENGLISH', 'MANDARIN', 'SPANISH', 'FRENCH', 'GERMAN', 'ITALIAN', 
       'PORTUGUESE', 'RUSSIAN', 'JAPANESE', 'KOREAN', 'ARABIC', 'HINDI',
       'BENGALI', 'URDU', 'TURKISH', 'POLISH', 'DUTCH', 'SWEDISH',
       'DANISH', 'NORWEGIAN', 'FINNISH', 'GREEK', 'HEBREW', 'THAI',
       'VIETNAMESE', 'INDONESIAN', 'MALAY', 'PERSIAN', 'SWAHILI',
       'UKRAINIAN', 'CZECH', 'ROMANIAN', 'HUNGARIAN', 'SERBIAN',
       'CROATIAN', 'BULGARIAN', 'SLOVAK', 'LITHUANIAN', 'LATVIAN',
       'ESTONIAN', 'SLOVENIAN', 'ALBANIAN', 'MACEDONIAN', 'GEORGIAN',
       'ARMENIAN', 'AZERBAIJANI', 'KAZAKH', 'UZBEK', 'MONGOLIAN',
       'NEPALI', 'SINHALA', 'BURMESE', 'KHMER', 'LAO', 'AMHARIC',
       'SOMALI', 'HAUSA', 'YORUBA', 'IGBO', 'ZULU', 'AFRIKAANS'].includes(name)) {
    return 'International';
  }
  
  // Philippine National Language
  if (name === 'TAGALOG' || name === 'FILIPINO') {
    return 'Filipino';
  }
  
  // Philippine Regional Languages and Dialects
  if (name.includes('BIKOL') || name.includes('CEBUANO') || name.includes('ILOCANO') ||
      name.includes('HILIGAYNON') || name.includes('WARAY') || name.includes('KAPAMPANGAN') ||
      name.includes('PANGASINAN') || name.includes('MARANAO') || name.includes('MAGUINDANAO') ||
      name.includes('TAUSUG') || name.includes('CHAVACANO') || name.includes('SURIGAONON') ||
      name.includes('AKLANON') || name.includes('KINARAY') || name.includes('CAPIZNON') ||
      name.includes('BONTOK') || name.includes('IFUGAO') || name.includes('KALINGA') ||
      name.includes('KANKANAY') || name.includes('IBALOI') || name.includes('ISNAG') ||
      name.includes('ITAWIS') || name.includes('IVATAN') || name.includes('IBANAG') ||
      name.includes('ILONGGO') || name.includes('ROMBLOMANON') || name.includes('MASBATENYO') ||
      name.includes('AGTA') || name.includes('AYTA') || name.includes('ATTA') ||
      name.includes('DUMAGAT') || name.includes('MANOBO') || name.includes('TBOLI') ||
      name.includes('BAGOBO') || name.includes('MANDAYA') || name.includes('MANSAKA') ||
      name.includes('SAMA') || name.includes('YAKAN') || name.includes('MOLBOG') ||
      name.includes('PALAWANO') || name.includes('TAGBANWA') || name.includes('BATAK') ||
      name.includes('CUYONON') || name.includes('AGUTAYNEN') || name.includes('BINUKID') ||
      name.includes('BUKIDNON') || name.includes('HIGAONON') || name.includes('SUBANEN') ||
      name.includes('BALANGAO') || name.includes('BONTOC') || name.includes('GADDANG') ||
      name.includes('ISINAI') || name.includes('YOGAD') || name.includes('PARANAN')) {
    return 'Filipino';
  }
  
  // Default: Filipino dialect if not recognized as international
  return 'Filipino';
};

// Enrich languages with type information
const enrichedLanguages = sortedLanguages.map(lang => ({
  ...lang,
  type: getLanguageType(lang.name)
}));

// Top 3 enriched
const topLanguages = enrichedLanguages.slice(0, 3);

const LanguageModal = ({ onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);

  // What the table actually displays
  const displayRows = hasSearched ? results : topLanguages;

  const handleSearch = () => {
    const lowerTerm = searchTerm.trim().toLowerCase();
    if (!lowerTerm) {
      // Empty search → reset back to default 3
      setHasSearched(false);
      setResults([]);
    } else {
      const filtered = enrichedLanguages.filter(lang =>
        lang.code.toLowerCase().includes(lowerTerm) ||
        lang.name.toLowerCase().includes(lowerTerm) ||
        lang.type.toLowerCase().includes(lowerTerm)
      );
      setResults(filtered);
      setHasSearched(true);
    }
    setCurrentPage(1);
    setPageWindowStart(1);
  };

  const totalPages = Math.ceil(displayRows.length / ITEMS_PER_PAGE);
  const paginated = hasSearched
    ? displayRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : displayRows; // default 3 — no pagination needed

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
          <h3>Select language</h3>
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
                  {LANGUAGE_COLUMNS.map(col => (
                    <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((lang, idx) => (
                  <tr key={idx} onClick={() => onSelect(lang)}>
                    {LANGUAGE_COLUMNS.map(col => (
                      <td key={col.key} className={col.blue ? 'text-blue' : ''}>{lang[col.key]}</td>
                    ))}
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

            {hasSearched && totalPages > 1 && (
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

const Step5 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step5 || {};

  const [languages, setLanguages] = useState(initialData.languages || []);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  const saveStepData = () => {
    updateFormData({
      step5: {
        languages
      }
    });
  };

  const handleNext = () => {
    if (languages.length === 0) {
      setErrors({ languages: "At least one language or dialect is required." });
      return;
    }
    setErrors({});
    saveStepData();
    onNext();
  };

  const handlePrev = () => {
    saveStepData();
    onPrev();
  };

  const handleSelectLanguage = (lang) => {
    if (!languages.find(l => l.code === lang.code)) {
      setLanguages(prev => [...prev, { ...lang, read: true, write: true, speak: true, understand: true }]);
    }
    setShowModal(false);
    if (errors.languages) setErrors(prev => ({ ...prev, languages: null }));
  };

  const removeLanguage = (code) => {
    setLanguages(prev => prev.filter(l => l.code !== code));
  };

  const toggleLanguageSkill = (code, skill) => {
    setLanguages(prev => prev.map(l => l.code === code ? { ...l, [skill]: !l[skill] } : l));
  };

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>LANGUAGE/DIALECTS</h2>
          <span className="step-indicator">Step 5 of 11</span>
        </div>

        <div className="form-body preferences-body">
          <div className="preference-section" style={{ borderBottom: 'none' }}>
            {errors.languages && <span className="error-text" style={{ display: 'block', marginBottom: '10px' }}>{errors.languages}</span>}

            {languages.length > 0 && (
              <div className="table-container" style={{ marginBottom: '15px' }}>
                <table className="search-results-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: '#555' }}>Language</th>
                      <th style={{ width: '120px', color: '#555' }}>Type</th>
                      <th style={{ width: '70px', color: '#555' }}>Read</th>
                      <th style={{ width: '70px', color: '#555' }}>Write</th>
                      <th style={{ width: '70px', color: '#555' }}>Speak</th>
                      <th style={{ width: '100px', color: '#555' }}>Understand</th>
                      <th style={{ width: '70px', color: '#555' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((lang) => (
                      <tr key={lang.code} style={{ cursor: 'default', backgroundColor: '#fff' }}>
                        <td style={{ textAlign: 'left', textTransform: 'uppercase' }}>{lang.name}</td>
                        <td style={{ textAlign: 'center', color: lang.type === 'International' ? '#2196F3' : '#4CAF50', fontWeight: '600' }}>
                          {lang.type || getLanguageType(lang.name)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={lang.read} onChange={() => toggleLanguageSkill(lang.code, 'read')} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={lang.write} onChange={() => toggleLanguageSkill(lang.code, 'write')} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={lang.speak} onChange={() => toggleLanguageSkill(lang.code, 'speak')} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={lang.understand} onChange={() => toggleLanguageSkill(lang.code, 'understand')} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="delete-icon-btn" 
                            onClick={() => removeLanguage(lang.code)} 
                            title="Delete"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#337ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            <button className="add-btn" onClick={() => setShowModal(true)}>
              <strong>+</strong> Add language
            </button>

          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {/* Language Modal */}
      {showModal && (
        <LanguageModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectLanguage}
        />
      )}
    </div>
  );
};

export default Step5;
