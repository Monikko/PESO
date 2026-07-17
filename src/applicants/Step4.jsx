import React, { useState } from 'react';
import './ApplicantForm.css';
import occupationsData from '../data/occupations.json';
import cityMunData from '../data/cityMunicipality.json';
import countriesData from '../data/countries.json';
import { useFormContext } from './FormContext';

const ITEMS_PER_PAGE = 10;
const WINDOW_SIZE = 10;

// Reusable paginated search modal
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

const OCCUPATION_COLUMNS = [
  { key: 'code', label: 'Code', width: '90px', blue: true },
  { key: 'occupation', label: 'Occupation', blue: true },
];

const CITY_MUN_COLUMNS = [
  { key: 'code', label: 'Code', width: '80px', blue: true },
  { key: 'name', label: 'City/Municipality', blue: true },
  { key: 'province', label: 'Province' },
];

const COUNTRY_COLUMNS = [
  { key: 'code', label: 'Code', width: '70px', blue: true },
  { key: 'name', label: 'Country', blue: true },
];

const sortedOccupations = [...occupationsData].sort((a, b) => a.occupation.localeCompare(b.occupation));
const sortedCityMun = [...cityMunData].sort((a, b) => a.name.localeCompare(b.name));
const sortedCountries = [...countriesData].sort((a, b) => a.name.localeCompare(b.name));

const Step4 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step4 || {};

  const [occupations, setOccupations] = useState(initialData.occupations || []);
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  const [isManualOccupation, setIsManualOccupation] = useState(false);
  const [manualOccupation, setManualOccupation] = useState('');

  const [localLocations, setLocalLocations] = useState(initialData.localLocations || []);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [isManualLocal, setIsManualLocal] = useState(false);
  const [manualLocal, setManualLocal] = useState('');

  const [overseasLocations, setOverseasLocations] = useState(initialData.overseasLocations || []);
  const [showOverseasModal, setShowOverseasModal] = useState(false);
  const [isManualOverseas, setIsManualOverseas] = useState(false);
  const [manualOverseas, setManualOverseas] = useState('');

  const saveStepData = () => {
    updateFormData({
      step4: {
        occupations,
        localLocations,
        overseasLocations
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

  const handleSelectOccupation = (occ) => {
    if (!occupations.find(o => o.code === occ.code)) {
      setOccupations(prev => [...prev, occ]);
    }
    setShowOccupationModal(false);
  };

  const removeOccupation = (code) => {
    setOccupations(prev => prev.filter(o => o.code !== code));
  };

  const addManualOccupation = () => {
    if (manualOccupation.trim()) {
      setOccupations(prev => [...prev, { code: 'MANUAL', occupation: manualOccupation.trim() }]);
      setManualOccupation('');
    }
  };

  const handleSelectLocalLocation = (loc) => {
    const label = `${loc.name}, ${loc.province}`;
    if (!localLocations.includes(label)) {
      setLocalLocations(prev => [...prev, label]);
    }
    setShowLocalModal(false);
  };

  const handleSelectOverseasLocation = (country) => {
    if (!overseasLocations.includes(country.name)) {
      setOverseasLocations(prev => [...prev, country.name]);
    }
    setShowOverseasModal(false);
  };

  const addManualLocal = () => {
    if (manualLocal.trim()) {
      if (!localLocations.includes(manualLocal.trim())) {
        setLocalLocations(prev => [...prev, manualLocal.trim()]);
      }
      setManualLocal('');
    }
  };

  const addManualOverseas = () => {
    if (manualOverseas.trim()) {
      if (!overseasLocations.includes(manualOverseas.trim())) {
        setOverseasLocations(prev => [...prev, manualOverseas.trim()]);
      }
      setManualOverseas('');
    }
  };

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>JOB PREFERENCES</h2>
          <span className="step-indicator">Step 4 of 11</span>
        </div>

        <div className="form-body preferences-body">

          {/* Preferred Occupation */}
          <div className="preference-section">
            <h4 className="preference-heading">PREFERRED OCCUPATION</h4>

            {occupations.length > 0 && (
              <div className="added-tags">
                {occupations.map((occ, idx) => (
                  <span key={idx} className="occupation-tag">
                    {occ.occupation}
                    <button className="remove-tag-btn" onClick={() => removeOccupation(occ.code)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <button className="add-btn" onClick={() => setShowOccupationModal(true)}>
              + Add occupation
            </button>

            <div className="checkbox-group" style={{ marginTop: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={isManualOccupation}
                  onChange={(e) => {
                    setIsManualOccupation(e.target.checked);
                    if (!e.target.checked) setManualOccupation('');
                  }}
                />
                {' '}Not in the list? Enter occupation manually
              </label>
            </div>

            {isManualOccupation && (
              <div className="manual-input-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type your preferred occupation"
                  value={manualOccupation}
                  onChange={(e) => setManualOccupation(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addManualOccupation(); }}
                />
                <button className="add-manual-btn" onClick={addManualOccupation}>Add</button>
              </div>
            )}
          </div>

          {/* Preferred Work Location - Local */}
          <div className="preference-section">
            <h4 className="preference-heading">PREFERRED WORK LOCATION - LOCAL</h4>
            {localLocations.length > 0 && (
              <div className="added-tags">
                {localLocations.map((loc, idx) => (
                  <span key={idx} className="occupation-tag">
                    {loc}
                    <button className="remove-tag-btn" onClick={() => setLocalLocations(prev => prev.filter((_, i) => i !== idx))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <button className="add-btn" onClick={() => setShowLocalModal(true)}>
              + Add location
            </button>
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input 
                  type="checkbox" 
                  style={{ marginRight: '8px' }}
                  checked={isManualLocal}
                  onChange={(e) => setIsManualLocal(e.target.checked)}
                />
                {' '}Not in the list? Enter location manually
              </label>
            </div>

            {isManualLocal && (
              <div className="manual-input-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type your preferred local location"
                  value={manualLocal}
                  onChange={(e) => setManualLocal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addManualLocal(); }}
                />
                <button className="add-manual-btn" onClick={addManualLocal}>Add</button>
              </div>
            )}
          </div>

          {/* Preferred Work Location - Overseas */}
          <div className="preference-section">
            <h4 className="preference-heading">PREFERRED WORK LOCATION - OVERSEAS</h4>
            {overseasLocations.length > 0 && (
              <div className="added-tags">
                {overseasLocations.map((loc, idx) => (
                  <span key={idx} className="occupation-tag">
                    {loc}
                    <button className="remove-tag-btn" onClick={() => setOverseasLocations(prev => prev.filter((_, i) => i !== idx))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <button className="add-btn" onClick={() => setShowOverseasModal(true)}>
              + Add location
            </button>
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                <input 
                  type="checkbox" 
                  style={{ marginRight: '8px' }}
                  checked={isManualOverseas}
                  onChange={(e) => setIsManualOverseas(e.target.checked)}
                />
                {' '}Not in the list? Enter location manually
              </label>
            </div>

            {isManualOverseas && (
              <div className="manual-input-wrapper">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type your preferred overseas location"
                  value={manualOverseas}
                  onChange={(e) => setManualOverseas(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addManualOverseas(); }}
                />
                <button className="add-manual-btn" onClick={addManualOverseas}>Add</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {/* Occupation Modal */}
      {showOccupationModal && (
        <SearchModal
          title="Select preferred occupation"
          columns={OCCUPATION_COLUMNS}
          data={sortedOccupations}
          onClose={() => setShowOccupationModal(false)}
          onSelect={handleSelectOccupation}
        />
      )}

      {/* Local Location Modal */}
      {showLocalModal && (
        <SearchModal
          title="Select city/municipality"
          columns={CITY_MUN_COLUMNS}
          data={sortedCityMun}
          onClose={() => setShowLocalModal(false)}
          onSelect={handleSelectLocalLocation}
        />
      )}

      {/* Overseas Location Modal */}
      {showOverseasModal && (
        <SearchModal
          title="Select country"
          columns={COUNTRY_COLUMNS}
          data={sortedCountries}
          onClose={() => setShowOverseasModal(false)}
          onSelect={handleSelectOverseasLocation}
        />
      )}
    </div>
  );
};

export default Step4;
