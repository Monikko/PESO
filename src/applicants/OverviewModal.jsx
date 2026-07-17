import React, { useState } from 'react';
import './ApplicantForm.css';
import { useFormContext } from './FormContext';

/* ─── shared display helpers ─── */
const Field = ({ label, value }) => (
  <div style={{ marginBottom: '6px', fontSize: '0.88rem', color: '#444' }}>
    <span style={{ fontWeight: 600, color: '#555' }}>{label}: </span>
    <span>{value || <span style={{ color: '#bbb', fontStyle: 'italic' }}>—</span>}</span>
  </div>
);
const TwoCol = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>{children}</div>
);
const RecordTable = ({ headers, rows }) => {
  if (!rows || rows.length === 0)
    return <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No records added.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#555', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '5px 10px', color: '#444', verticalAlign: 'top', textTransform: 'uppercase' }}>{cell || '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const Section = ({ children }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '6px', marginBottom: '16px', padding: '16px' }}>
    {children}
  </div>
);

/* ─── inline edit helpers ─── */
const IL = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>{label}</label>
    {children}
  </div>
);
const IField = ({ value, onChange, type = 'text', placeholder, disabled, readOnly }) => (
  <input type={type} value={value || ''} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
    style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box', backgroundColor: (disabled || readOnly) ? '#f5f5f5' : '#fff', color: (disabled || readOnly) ? '#777' : 'inherit', textTransform: type === 'email' ? 'none' : 'uppercase' }} />
);
const ISelect = ({ value, onChange, children }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)}
    style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }}>
    {children}
  </select>
);
const TwoGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>{children}</div>
);
const SaveBar = ({ onSave, onCancel }) => (
  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
    <button onClick={onSave} style={{ padding: '7px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>Save Changes</button>
    <button onClick={onCancel} style={{ padding: '7px 16px', background: '#fff', color: '#555', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem' }}>Cancel</button>
  </div>
);

/* ─── section header ─── */
const SectionHeader = ({ title, editing, onEdit, onCancel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
    <h3 style={{ margin: 0, fontSize: '1rem', color: '#337ab7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
    {!editing
      ? <button onClick={onEdit} style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
      : <button onClick={onCancel} style={{ background: '#aaa', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' }}>✕ Close</button>
    }
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const OverviewModal = ({ onClose, onSubmitFinal }) => {
  const { formData, updateFormData } = useFormContext();
  const [editing, setEditing] = useState(null); // which step is open for edit

  const s2 = formData.step2 || {};
  const s3 = formData.step3 || {};
  const s4 = formData.step4 || {};
  const s5 = formData.step5 || {};
  const s6 = formData.step6 || {};
  const s7 = formData.step7 || {};
  const s8 = formData.step8 || {};
  const s9 = formData.step9 || {};
  const s10 = formData.step10 || {};
  const s11 = formData.step11 || {};

  /* ── Step 1 edit state ── */
  const [e1, setE1] = useState({});
  const openEdit1 = () => { setE1({ lastName: formData.lastName, firstName: formData.firstName, middleName: formData.middleName, suffix: formData.suffix, dob: formData.dob, sex: formData.sex }); setEditing(1); };
  const saveEdit1 = () => { updateFormData(e1); setEditing(null); };

  /* ── Step 2 edit state ── */
  const [e2, setE2] = useState({});
  const openEdit2 = () => { setE2({ ...s2 }); setEditing(2); };
  const saveEdit2 = () => { updateFormData({ step2: e2 }); setEditing(null); };

  /* ── Step 3 edit state ── */
  const [e3, setE3] = useState({});
  const openEdit3 = () => { setE3({ ...s3 }); setEditing(3); };
  const saveEdit3 = () => { updateFormData({ step3: e3 }); setEditing(null); };

  /* ── Step 11 edit state ── */
  const [e11, setE11] = useState({});
  const openEdit11 = () => { setE11({ ...(formData.step11 || {}) }); setEditing(11); };
  const saveEdit11 = () => { updateFormData({ step11: e11 }); setEditing(null); };

  /* ── Step 10 edit state ── */
  const [newSkill, setNewSkill] = useState('');
  const addSkill = () => {
    if (newSkill.trim()) {
      const arr = [...(s10.selectedSkills || [])];
      arr.push(newSkill.trim());
      updateFormData({ step10: { ...s10, selectedSkills: arr } });
      setNewSkill('');
    }
  };

  /* ── Array step helpers (delete rows directly) ── */
  const deleteRow = (stepKey, arrayKey, idx) => {
    const step = formData[stepKey] || {};
    const arr = [...(step[arrayKey] || [])];
    arr.splice(idx, 1);
    updateFormData({ [stepKey]: { ...step, [arrayKey]: arr } });
  };

  const deleteSkill = (idx) => {
    const arr = [...(s10.selectedSkills || [])];
    arr.splice(idx, 1);
    updateFormData({ step10: { ...s10, selectedSkills: arr } });
  };

  /* ─── DOB helpers for Step 1 inline edit ─── */
  const dobParts = (dob) => {
    const p = (dob || '--').split('-');
    return { year: p[0] || '', month: p[1] || '', day: p[2] || '' };
  };
  const setDobPart = (field, val) => {
    const { year, month, day } = dobParts(e1.dob);
    const next = { year, month, day, [field]: val };
    setE1(prev => ({ ...prev, dob: `${next.year}-${next.month}-${next.day}` }));
  };

  /* ─── icon buttons ─── */
  const TrashBtn = ({ onClick }) => (
    <button onClick={onClick} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#c0392b' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  );

  const inlineTableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginTop: '4px' };
  const thStyle = { padding: '5px 8px', background: '#f5f5f5', borderBottom: '1px solid #ddd', color: '#555', textAlign: 'left', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '4px 8px', borderBottom: '1px solid #f0f0f0', color: '#444', textTransform: 'uppercase', verticalAlign: 'middle' };
  const tdAction = { ...tdStyle, textAlign: 'center', width: '40px' };

  return (
    <div className="modal-overlay">
      <div className="modal-content overview-modal" style={{ maxWidth: '860px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem' }}>Application Overview</h2>
          <button className="close-btn" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#ffffff' }}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
            Review your information. Click <strong>Edit</strong> on any section to make changes directly here.
          </p>

          {/* ══ STEP 1 ══ */}
          <Section>
            <SectionHeader title="Step 1: Personal Information" editing={editing === 1} onEdit={openEdit1} onCancel={() => setEditing(null)} />
            {editing === 1 ? (
              <>
                <TwoGrid>
                  <IL label="Last Name"><IField value={e1.lastName} onChange={v => setE1(p => ({ ...p, lastName: v }))} /></IL>
                  <IL label="First Name"><IField value={e1.firstName} onChange={v => setE1(p => ({ ...p, firstName: v }))} /></IL>
                  <IL label="Middle Name"><IField value={e1.middleName} onChange={v => setE1(p => ({ ...p, middleName: v }))} /></IL>
                  <IL label="Suffix">
                    <ISelect value={e1.suffix} onChange={v => setE1(p => ({ ...p, suffix: v }))}>
                      <option value="NONE">NONE</option>
                      {['SR','JR','I','II','III','IV','V','VI','VII','VIII','IX','X'].map(s => <option key={s} value={s}>{s}</option>)}
                    </ISelect>
                  </IL>
                </TwoGrid>
                <IL label="Date of Birth">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ISelect value={dobParts(e1.dob).month} onChange={v => setDobPart('month', v)}>
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                        <option key={m} value={m}>{new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'short' })}</option>
                      ))}
                    </ISelect>
                    <ISelect value={dobParts(e1.dob).day} onChange={v => setDobPart('day', v)}>
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
                    </ISelect>
                    <ISelect value={dobParts(e1.dob).year} onChange={v => setDobPart('year', v)}>
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </ISelect>
                  </div>
                </IL>
                <IL label="Sex">
                  <ISelect value={e1.sex} onChange={v => setE1(p => ({ ...p, sex: v }))}>
                    <option value="">SELECT</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </ISelect>
                </IL>
                <SaveBar onSave={saveEdit1} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <TwoCol>
                <Field label="First Name" value={formData.firstName} />
                <Field label="Middle Name" value={formData.middleName} />
                <Field label="Last Name" value={formData.lastName} />
                <Field label="Suffix" value={formData.suffix} />
                <Field label="Date of Birth" value={formData.dob} />
                <Field label="Sex" value={formData.sex} />
                <Field label="Resume" value={formData.resumeFile ? formData.resumeFile.name : null} />
              </TwoCol>
            )}
          </Section>

          {/* ══ STEP 2 ══ */}
          <Section>
            <SectionHeader title="Step 2: Address & Contact" editing={editing === 2} onEdit={openEdit2} onCancel={() => setEditing(null)} />
            {editing === 2 ? (
              <>
                <TwoGrid>
                  <IL label="Civil Status">
                    <ISelect value={e2.civilStatus} onChange={v => setE2(p => ({ ...p, civilStatus: v }))}>
                      <option value="">SELECT</option>
                      {['Single','Married','Widowed','Legally Separated','Annulled','Unknown'].map(o => <option key={o} value={o}>{o}</option>)}
                    </ISelect>
                  </IL>
                  <IL label="Religion"><IField value={e2.religion} onChange={v => setE2(p => ({ ...p, religion: v }))} /></IL>
                  <IL label="Present Address"><IField value={e2.presentAddress} onChange={v => setE2(p => ({ ...p, presentAddress: v }))} /></IL>
                  <IL label="Barangay"><IField value={e2.barangay} onChange={v => setE2(p => ({ ...p, barangay: v }))} /></IL>
                  <IL label="City/Municipality"><IField value={e2.city} onChange={v => setE2(p => ({ ...p, city: v }))} /></IL>
                  <IL label="Province"><IField value={e2.province} onChange={v => setE2(p => ({ ...p, province: v }))} /></IL>
                  <IL label="Height (cm)"><IField value={e2.heightCm} onChange={v => setE2(p => ({ ...p, heightCm: v }))} /></IL>
                  <IL label="Cellphone"><IField value={e2.cellphone} onChange={v => setE2(p => ({ ...p, cellphone: v }))} /></IL>
                  <IL label="Landline"><IField value={e2.landline} onChange={v => setE2(p => ({ ...p, landline: v }))} /></IL>
                  <IL label="Email"><IField value={e2.email} onChange={v => setE2(p => ({ ...p, email: v }))} /></IL>
                  <IL label="TIN"><IField value={e2.tin} onChange={v => setE2(p => ({ ...p, tin: v }))} /></IL>
                </TwoGrid>
                <SaveBar onSave={saveEdit2} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <TwoCol>
                <Field label="Civil Status" value={s2.civilStatus} />
                <Field label="Religion" value={s2.religion} />
                <Field label="Present Address" value={s2.presentAddress} />
                <Field label="Barangay" value={s2.barangay} />
                <Field label="City/Municipality" value={s2.city} />
                <Field label="Province" value={s2.province} />
                <Field label="Height (cm)" value={s2.heightCm} />
                <Field label="Cellphone" value={s2.cellphone} />
                <Field label="Landline" value={s2.landline} />
                <Field label="Email" value={s2.email} />
                <Field label="TIN" value={s2.tin} />
                <Field label="Disabilities" value={s2.disabilities && s2.disabilities.length > 0 ? s2.disabilities.join(', ') : null} />
              </TwoCol>
            )}
          </Section>

          {/* ══ STEP 3 ══ */}
          <Section>
            <SectionHeader title="Step 3: Employment Status" editing={editing === 3} onEdit={openEdit3} onCancel={() => setEditing(null)} />
            {editing === 3 ? (
              <>
                <IL label="Employment Status">
                  <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                    {['employed', 'unemployed'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                        <input type="radio" name="ov_empStatus" checked={e3.employmentStatus === s} onChange={() => setE3(p => ({ ...p, employmentStatus: s, subStatus: '' }))} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    ))}
                  </div>
                </IL>
                {e3.employmentStatus && (
                  <IL label="Sub-status">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      {(e3.employmentStatus === 'employed'
                        ? [['wage', 'Wage employed'], ['self', 'Self-employed'], ['others', 'Others']]
                        : [['new_entrant','New entrant/fresh graduate'],['finished_contract','Finished contract'],['resigned','Resigned'],['retired','Retired'],['terminated_calamity','Terminated/Laid off due to calamity'],['terminated_local','Terminated/Laid off (local)'],['terminated_abroad','Terminated/Laid off (abroad)'],['displaced_pogo','Displaced POGO Worker'],['others','Others']]
                      ).map(([val, label]) => (
                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                          <input type="radio" name="ov_subStatus" checked={e3.subStatus === val} onChange={() => setE3(p => ({ ...p, subStatus: val }))} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </IL>
                )}
                <IL label="Months looking for work">
                  <IField value={e3.lookingForWorkMonths} type="number" onChange={v => setE3(p => ({ ...p, lookingForWorkMonths: v }))} />
                </IL>
                <SaveBar onSave={saveEdit3} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <TwoCol>
                <Field label="Employment Status" value={s3.employmentStatus} />
                <Field label="Sub-status" value={s3.subStatus} />
                <Field label="Looking for work (months)" value={s3.lookingForWorkMonths} />
              </TwoCol>
            )}
          </Section>

          {/* ══ STEP 4 ══ */}
          <Section>
            <SectionHeader title="Step 4: Job Preferences" editing={editing === 4} onEdit={() => setEditing(4)} onCancel={() => setEditing(null)} />
            
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Preferred Occupation</p>
            {(s4.occupations && s4.occupations.length > 0) ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {s4.occupations.map((occ, idx) => (
                  <span key={occ.code} style={{ background: '#e8f0fe', color: '#337ab7', padding: editing === 4 ? '3px 6px 3px 10px' : '3px 10px', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid #c5d9fb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {occ.occupation}
                    {editing === 4 && (
                      <button onClick={() => deleteRow('step4', 'occupations', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', padding: '0', fontSize: '14px', lineHeight: 1 }}>×</button>
                    )}
                  </span>
                ))}
              </div>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0 16px' }}>No occupations selected.</p>}

            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Preferred Work Location (Local)</p>
            {(s4.localLocations && s4.localLocations.length > 0) ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {s4.localLocations.map((loc, idx) => (
                  <span key={idx} style={{ background: '#e8f0fe', color: '#337ab7', padding: editing === 4 ? '3px 6px 3px 10px' : '3px 10px', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid #c5d9fb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {loc}
                    {editing === 4 && (
                      <button onClick={() => deleteRow('step4', 'localLocations', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', padding: '0', fontSize: '14px', lineHeight: 1 }}>×</button>
                    )}
                  </span>
                ))}
              </div>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0 16px' }}>No local locations selected.</p>}

            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Preferred Work Location (Overseas)</p>
            {(s4.overseasLocations && s4.overseasLocations.length > 0) ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {s4.overseasLocations.map((loc, idx) => (
                  <span key={idx} style={{ background: '#e8f0fe', color: '#337ab7', padding: editing === 4 ? '3px 6px 3px 10px' : '3px 10px', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid #c5d9fb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {loc}
                    {editing === 4 && (
                      <button onClick={() => deleteRow('step4', 'overseasLocations', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', padding: '0', fontSize: '14px', lineHeight: 1 }}>×</button>
                    )}
                  </span>
                ))}
              </div>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No overseas locations selected.</p>}
            
            {editing === 4 && (
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontStyle: 'italic' }}>To add new job preferences, go back to Step 4.</p>
            )}
          </Section>

          {/* ══ STEP 5 ══ */}
          <Section>
            <SectionHeader title="Step 5: Languages" editing={editing === 5} onEdit={() => setEditing(5)} onCancel={() => setEditing(null)} />
            {(s5.languages && s5.languages.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Language</th>
                  <th style={thStyle}>Read</th>
                  <th style={thStyle}>Write</th>
                  <th style={thStyle}>Speak</th>
                  <th style={thStyle}>Understand</th>
                  {editing === 5 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {(s5.languages || []).map((l, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{l.name || l.language}</td>
                      <td style={tdStyle}>{l.read ? '✓' : ''}</td>
                      <td style={tdStyle}>{l.write ? '✓' : ''}</td>
                      <td style={tdStyle}>{l.speak ? '✓' : ''}</td>
                      <td style={tdStyle}>{l.understand ? '✓' : ''}</td>
                      {editing === 5 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step5', 'languages', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No languages added.</p>
            )}
            {editing === 5 && (
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontStyle: 'italic' }}>To add new language records, go back to Step 5.</p>
            )}
          </Section>

          {/* ══ STEP 6 ══ */}
          <Section>
            <SectionHeader title="Step 6: Educational Background" editing={editing === 6} onEdit={() => setEditing(6)} onCancel={() => setEditing(null)} />
            {(s6.records && s6.records.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Level</th>
                  <th style={thStyle}>School</th>
                  <th style={thStyle}>Course</th>
                  <th style={{ ...thStyle, width: '80px' }}>Year Grad.</th>
                  {editing === 6 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {(s6.records || []).map((r, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{r.educationLevel}</td>
                      <td style={tdStyle}>{r.school}</td>
                      <td style={tdStyle}>{r.course}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{r.yearGraduated}</td>
                      {editing === 6 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step6', 'records', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No records added.</p>
            )}
            {editing === 6 && (
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontStyle: 'italic' }}>To add or edit individual records, go back to Step 6.</p>
            )}
          </Section>

          {/* ══ STEP 7 ══ */}
          <Section>
            <SectionHeader title="Step 7: Certifications & Trainings" editing={editing === 7} onEdit={() => setEditing(7)} onCancel={() => setEditing(null)} />
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Certifications</p>
            {(s7.certifications && s7.certifications.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Certificate</th>
                  <th style={thStyle}>Issued By</th>
                  <th style={thStyle}>Date Issued</th>
                  <th style={thStyle}>Rating</th>
                  {editing === 7 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {s7.certifications.map((c, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{c.certificate}</td>
                      <td style={tdStyle}>{c.issuedBy}</td>
                      <td style={tdStyle}>{c.dateIssued}</td>
                      <td style={tdStyle}>{c.rating}</td>
                      {editing === 7 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step7', 'certifications', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No certifications.</p>}

            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', margin: '14px 0 6px' }}>Technical/Vocational Trainings</p>
            {(s7.trainings && s7.trainings.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Training</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Conducted By</th>
                  <th style={thStyle}>Completed</th>
                  {editing === 7 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {s7.trainings.map((t, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{t.trainingName}</td>
                      <td style={tdStyle}>{t.dateFrom}</td>
                      <td style={tdStyle}>{t.dateTo}</td>
                      <td style={tdStyle}>{t.conductedBy}</td>
                      <td style={tdStyle}>{t.completed}</td>
                      {editing === 7 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step7', 'trainings', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No trainings.</p>}
          </Section>

          {/* ══ STEP 8 ══ */}
          <Section>
            <SectionHeader title="Step 8: Eligibility & License" editing={editing === 8} onEdit={() => setEditing(8)} onCancel={() => setEditing(null)} />
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>Eligibilities</p>
            {(s8.eligibilities && s8.eligibilities.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Eligibility</th>
                  <th style={thStyle}>Date Taken</th>
                  {editing === 8 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {s8.eligibilities.map((e, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{e.eligibility}</td>
                      <td style={tdStyle}>{e.dateTaken}</td>
                      {editing === 8 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step8', 'eligibilities', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No eligibilities.</p>}

            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555', margin: '14px 0 6px' }}>Licenses</p>
            {(s8.licenses && s8.licenses.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>License</th>
                  <th style={thStyle}>Valid Until</th>
                  {editing === 8 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {s8.licenses.map((l, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{l.license}</td>
                      <td style={tdStyle}>{l.validUntil}</td>
                      {editing === 8 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step8', 'licenses', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No licenses.</p>}
          </Section>

          {/* ══ STEP 9 ══ */}
          <Section>
            <SectionHeader title="Step 9: Work Experience" editing={editing === 9} onEdit={() => setEditing(9)} onCancel={() => setEditing(null)} />
            {(s9.workExperiences && s9.workExperiences.length > 0) ? (
              <table style={inlineTableStyle}>
                <thead><tr>
                  <th style={thStyle}>Employer</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Position</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Status</th>
                  {editing === 9 && <th style={thStyle}>Del</th>}
                </tr></thead>
                <tbody>
                  {s9.workExperiences.map((w, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{w.employerName}</td>
                      <td style={tdStyle}>{w.address}</td>
                      <td style={tdStyle}>{w.positionHeld}</td>
                      <td style={tdStyle}>{w.dateFrom}</td>
                      <td style={tdStyle}>{w.dateTo}</td>
                      <td style={tdStyle}>{w.status}</td>
                      {editing === 9 && <td style={tdAction}><TrashBtn onClick={() => deleteRow('step9', 'workExperiences', idx)} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No work experience added.</p>
            )}
          </Section>

          {/* ══ STEP 10 ══ */}
          <Section>
            <SectionHeader title="Step 10: Other Skills" editing={editing === 10} onEdit={() => setEditing(10)} onCancel={() => setEditing(null)} />
            {editing === 10 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <IField value={newSkill} onChange={setNewSkill} placeholder="TYPE A SKILL..." />
                <button onClick={addSkill} style={{ background: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', padding: '0 16px', cursor: 'pointer', fontSize: '0.85rem' }}>Add</button>
              </div>
            )}
            {s10.selectedSkills && s10.selectedSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {s10.selectedSkills.map((skill, idx) => (
                  <span key={skill} style={{ background: '#e8f0fe', color: '#337ab7', padding: editing === 10 ? '3px 6px 3px 10px' : '3px 10px', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid #c5d9fb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {skill}
                    {editing === 10 && (
                      <button onClick={() => deleteSkill(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', padding: '0', fontSize: '14px', lineHeight: 1 }}>×</button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#bbb', fontStyle: 'italic', fontSize: '0.85rem', margin: '4px 0' }}>No skills selected.</p>
            )}
          </Section>

          {/* ══ STEP 11 ══ */}
          <Section>
            <SectionHeader title="Step 11: Registration Details" editing={editing === 11} onEdit={openEdit11} onCancel={() => setEditing(null)} />
            {editing === 11 ? (
              <>
                <TwoGrid>
                  <IL label="Registration Date"><IField value={e11.registrationDate} type="date" readOnly /></IL>
                  <IL label="PESO ID"><IField value={e11.pesoId} readOnly /></IL>
                  <IL label="Encoded By"><IField value={e11.encodedBy} readOnly /></IL>
                </TwoGrid>
                <IL label="Remarks">
                  <textarea value={e11.remarks || ''} onChange={e => setE11(p => ({ ...p, remarks: e.target.value }))}
                    style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }} />
                </IL>
                <SaveBar onSave={saveEdit11} onCancel={() => setEditing(null)} />
              </>
            ) : (
              <TwoCol>
                <Field label="Registration Date" value={s11.registrationDate} />
                <Field label="PESO ID" value={s11.pesoId} />
                <Field label="Assessed By" value={s11.assessedBy !== 'SELECT' ? s11.assessedBy : null} />
                <Field label="Encoded By" value={s11.encodedBy} />
                <Field label="Remarks" value={s11.remarks} />
              </TwoCol>
            )}
          </Section>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
          <button className="nav-btn previous-btn" onClick={onClose} style={{ width: 'auto', padding: '0 20px' }}>Cancel</button>
          <button className="nav-btn next-btn" onClick={onSubmitFinal} style={{ width: 'auto', padding: '0 20px', background: '#5cb85c', borderColor: '#4cae4c' }}>
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewModal;
