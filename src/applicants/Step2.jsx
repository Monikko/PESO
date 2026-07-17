import React, { useState } from 'react';
import './ApplicantForm.css';
import region3Data from '../data/region3.json';
import { useFormContext } from './FormContext';

const religionOptions = [
  "TWELVE TRIBES OF ISRAEL", "ASSEMBLY OF GOD", "AGLIPAYAN", "BORN AGAIN CHRISTIAN", 
  "BAPTIST", "BUDDIST", "CHURCH OF GOD THRU CHRIST JESUS", "CHRISTIAN", 
  "CHURCH OF CHRIST", "CHURCH OF GOD", "EPISCOPALIAN ANGELICAN", "ESPIRITISM", 
  "EVANGELICAL", "FOUR SQUARE GOSPEL CHURCH", "FAITH TABERNACLE", "HINDU", 
  "IGLESIA SA DIYOS ESPIRITU SANTO", "IGLESIA NI CRISTO", "IGLESIA NG DIYOS KAY CRISTO JESUS", 
  "ISLAM", "JESUS MIRACLE CRUSADE", "JEHOVAH'S WITNESSES", "LUTHERAN", "METHODIST", 
  "CHURCH OF LATTER DAY SAINT", "NON-SECTORAL CHARISMATIC", "ORTHODOX", "OTHERS", 
  "PENTECOSTAL", "PHILIPPINE INDEPENDENT CHRISTIAN CHURCH(PICC/IFI)", "FOURTH WATCH", 
  "PRESBYTERIAN", "PROTESTANT", "ROMAN CATHOLIC", "RIZALIST", "SEVENTH DAY ADVENTIST", 
  "UNITED CHURCH CHRISTIAN OF THE PHILIPPINES (UCCP)", "UNION ESPIRITISTA CRISTIANA", 
  "WESLEYAN CHURCH", "WORD OF HOPE"
];

const Step2 = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormContext();
  const initialData = formData.step2 || {};

  const [civilStatus, setCivilStatus] = useState(initialData.civilStatus || '');
  const [presentAddress, setPresentAddress] = useState(initialData.presentAddress || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [barangay, setBarangay] = useState(initialData.barangay || '');
  const [city, setCity] = useState(initialData.city || '');
  const [province, setProvince] = useState(initialData.province || '');
  const [notFromRegion3, setNotFromRegion3] = useState(initialData.notFromRegion3 || false);

  const [heightCm, setHeightCm] = useState(initialData.heightCm || '');
  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  
  const [religion, setReligion] = useState(initialData.religion || '');
  const [tin, setTin] = useState(initialData.tin || '');
  const [landline, setLandline] = useState(initialData.landline || '');
  const [cellphone, setCellphone] = useState(initialData.cellphone || '');
  const [email, setEmail] = useState(initialData.email || '');

  const [disabilities, setDisabilities] = useState(initialData.disabilities || []);
  
  const [is4ps, setIs4ps] = useState(initialData.is4ps || false);
  const [householdId, setHouseholdId] = useState(initialData.householdId || '');
  
  const [isOfw, setIsOfw] = useState(initialData.isOfw || false);
  const [ofwCountry, setOfwCountry] = useState(initialData.ofwCountry || '');
  
  const [isFormerOfw, setIsFormerOfw] = useState(initialData.isFormerOfw || false);
  const [latestDeploymentCountry, setLatestDeploymentCountry] = useState(initialData.latestDeploymentCountry || '');
  const [returnMonth, setReturnMonth] = useState(initialData.returnMonth || '');
  const [returnYear, setReturnYear] = useState(initialData.returnYear || '');

  const saveStepData = () => {
    updateFormData({
      step2: {
        civilStatus, presentAddress, barangay, city, province, notFromRegion3,
        heightCm, religion, tin, landline, cellphone, email, disabilities,
        is4ps, householdId, isOfw, ofwCountry, isFormerOfw, latestDeploymentCountry,
        returnMonth, returnYear
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

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setSearchResults([]);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setSearchResults([]);
      setCurrentPage(1);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    const searchTerms = lowerTerm.split(/\s+/).filter(Boolean);
    
    const results = region3Data.filter(item => {
      const fullString = `${item.name.toLowerCase()} ${item.city.toLowerCase()}`;
      return searchTerms.every(term => fullString.includes(term));
    }).sort((a, b) => a.name.localeCompare(b.name));
    setSearchResults(results);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectBarangay = (item) => {
    setBarangay(item.name);
    
    // Parse the mock city string "CABANATUAN CITY, NUEVA ECIJA"
    const parts = item.city.split(',');
    if (parts.length > 1) {
      setCity(parts[0].trim());
      setProvince(parts[1].trim());
    } else {
      setCity(item.city);
    }
    
    closeModal();
  };

  const handleTinChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    
    let formatted = val;
    if (val.length > 6) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
    } else if (val.length > 3) {
      formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    }
    
    setTin(formatted);
  };

  return (
    <div className="applicant-container relative-container">

      {/* Main Card */}
      <div className="form-card">
        <div className="form-header">
          <h2>PERSONAL INFORMATION</h2>
          <span className="step-indicator">Step 2 of 11</span>
        </div>

        <div className="form-body">
          <div className="form-row">
            <label>Civil status</label>
            <select className="select-field" value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)}>
              <option value="">SELECT</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>

          <div className="form-row">
            <label>Present address</label>
            <div className="input-wrapper">
              <input type="text" className="input-field" placeholder="HOUSE NO., STREET, VILLAGE" autoFocus value={presentAddress} onChange={(e) => setPresentAddress(e.target.value)} />
              <div className="checkbox-group" style={{ marginTop: '5px', paddingTop: '0' }}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={notFromRegion3}
                    onChange={(e) => {
                      setNotFromRegion3(e.target.checked);
                      if (e.target.checked) {
                        setBarangay('');
                        setCity('');
                        setProvince('');
                      }
                    }}
                  /> 
                  Not from Region 3?
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label>Barangay</label>
            <div className="input-with-button">
              <input 
                type="text" 
                className={`input-field ${!notFromRegion3 ? 'cursor-pointer' : ''}`} 
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                onClick={!notFromRegion3 ? openModal : undefined}
                readOnly={!notFromRegion3}
              />
              {!notFromRegion3 && (
                <button className="icon-btn search-btn" onClick={openModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>City/Municipality</label>
            <input 
              type="text" 
              className="input-field" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Province</label>
            <input 
              type="text" 
              className="input-field" 
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Height</label>
            <div className="input-with-button short-input-wrapper">
              <input 
                type="text" 
                className="input-field short-input" 
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="cm"
              />
              <button type="button" className="icon-btn id-btn" onClick={() => setIsHeightModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d9534f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                  <line x1="8" y1="10" x2="16" y2="10"></line>
                  <line x1="8" y1="14" x2="16" y2="14"></line>
                  <circle cx="8" cy="10" r="1" fill="#d9534f"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="form-row">
            <label>Religion</label>
            <select className="select-field" value={religion} onChange={(e) => setReligion(e.target.value)}>
              <option value="">SELECT</option>
              {religionOptions.map((rel, index) => (
                <option key={index} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>TIN</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="___-___-___" 
              value={tin}
              onChange={handleTinChange}
            />
          </div>

          <div className="form-row">
            <label>Landline no.</label>
            <input type="text" className="input-field" value={landline} onChange={(e) => setLandline(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Cellphone no.</label>
            <input type="text" className="input-field" value={cellphone} onChange={(e) => setCellphone(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Email address</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Disability</label>
            <div className="checkbox-group multi-line">
              {['Visual', 'Hearing', 'Speech', 'Physical', 'Mental', 'Others'].map(d => (
                <label key={d}>
                  <input 
                    type="checkbox" 
                    checked={disabilities.includes(d)}
                    onChange={(e) => {
                      if (e.target.checked) setDisabilities(prev => [...prev, d]);
                      else setDisabilities(prev => prev.filter(i => i !== d));
                    }}
                  /> {d}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>4Ps beneficiary?</label>
            <div className="checkbox-group">
              <label><input type="checkbox" checked={is4ps} onChange={(e) => setIs4ps(e.target.checked)} /> Yes</label>
            </div>
          </div>

          <div className="form-row">
            <label>Household ID No.</label>
            <input type="text" className="input-field" value={householdId} onChange={(e) => setHouseholdId(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Are you an OFW?</label>
            <div className="checkbox-group">
              <label><input type="checkbox" checked={isOfw} onChange={(e) => setIsOfw(e.target.checked)} /> Yes</label>
            </div>
          </div>

          <div className="form-row">
            <label>Specify country</label>
            <input type="text" className="input-field" value={ofwCountry} onChange={(e) => setOfwCountry(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Are you a former OFW?</label>
            <div className="checkbox-group">
              <label><input type="checkbox" checked={isFormerOfw} onChange={(e) => setIsFormerOfw(e.target.checked)} /> Yes</label>
            </div>
          </div>

          <div className="form-row">
            <label>Latest country of deployment</label>
            <input type="text" className="input-field" value={latestDeploymentCountry} onChange={(e) => setLatestDeploymentCountry(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Month and year of return<br/>to Philippines</label>
            <div className="multi-select-wrapper">
              <select className="select-field short-select" value={returnMonth} onChange={(e) => setReturnMonth(e.target.value)}>
                <option value="">SELECT</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select className="select-field short-select" value={returnYear} onChange={(e) => setReturnYear(e.target.value)}>
                <option value="">SELECT</option>
                {Array.from({ length: 77 }, (_, i) => 2026 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="form-navigation">
        <button className="nav-btn previous-btn" onClick={handlePrev}>Previous</button>
        <button className="nav-btn next-btn" onClick={handleNext}>Save &amp; Continue</button>
      </div>

      {/* Barangay Search Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select barangay</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search term" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  autoFocus
                />
                <button className="search-action-btn" onClick={handleSearch}>Search</button>
              </div>

              {searchResults.length > 0 && (
                <div className="table-container">
                  <table className="search-results-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Barangay</th>
                        <th>City/Municipality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedResults.map((result, idx) => (
                        <tr key={idx} onClick={() => handleSelectBarangay(result)}>
                          <td className="text-blue">{result.code}</td>
                          <td className="text-blue">{result.name}</td>
                          <td>{result.city}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="pagination">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                        <button 
                          key={page} 
                          className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Height Conversion Modal */}
      {isHeightModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '280px' }}>
            <div className="modal-header">
              <h3>Convert height to cm</h3>
              <button className="close-btn" onClick={() => setIsHeightModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="convert-input-group">
                <input 
                  type="number" 
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="convert-input" 
                />
                <span className="convert-unit">ft</span>
              </div>
              <div className="convert-input-group" style={{ marginTop: '10px' }}>
                <input 
                  type="number" 
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="convert-input" 
                />
                <span className="convert-unit">in</span>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button 
                  className="convert-action-btn"
                  onClick={() => {
                    const f = parseFloat(feet) || 0;
                    const i = parseFloat(inches) || 0;
                    const totalCm = (f * 30.48) + (i * 2.54);
                    setHeightCm(totalCm > 0 ? Math.round(totalCm).toString() : '');
                    setIsHeightModalOpen(false);
                    setFeet('');
                    setInches('');
                  }}
                >
                  Convert
                </button>
                <button 
                  className="convert-cancel-btn"
                  onClick={() => setIsHeightModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2;
