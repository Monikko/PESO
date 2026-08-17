import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminDashboard.css';

const AuditLog = ({ onBack }) => {
  const [auditRecords, setAuditRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    approverName: 'all',
    dateFrom: '',
    dateTo: '',
    searchApplicant: ''
  });

  useEffect(() => {
    fetchAuditRecords();
  }, []);

  const fetchAuditRecords = async () => {
    setLoading(true);
    try {
      // Fetch all approved applicants with approval info
      const { data, error } = await supabase
        .from('applicants')
        .select('id, first_name, middle_name, surname, suffix, approved_by, approval_date, approved_by_admin')
        .eq('approved_by_admin', true)
        .order('approval_date', { ascending: false });

      if (error) throw error;

      setAuditRecords(data || []);
    } catch (err) {
      console.error('Error fetching audit records:', err);
      alert('Error loading audit records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique approver names for filter
  const approverNames = [...new Set(auditRecords.map(r => r.approved_by).filter(Boolean))];

  // Apply filters
  const filteredRecords = auditRecords.filter(record => {
    // Filter by approver name
    if (filters.approverName !== 'all' && record.approved_by !== filters.approverName) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom && record.approval_date) {
      const approvalDate = new Date(record.approval_date);
      const fromDate = new Date(filters.dateFrom);
      if (approvalDate < fromDate) return false;
    }

    if (filters.dateTo && record.approval_date) {
      const approvalDate = new Date(record.approval_date);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (approvalDate > toDate) return false;
    }

    // Filter by applicant name
    if (filters.searchApplicant) {
      const searchLower = filters.searchApplicant.toLowerCase();
      const fullName = `${record.first_name} ${record.middle_name} ${record.surname}`.toLowerCase();
      if (!fullName.includes(searchLower)) return false;
    }

    return true;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['Approver Name', 'Applicant Name', 'Approval Date', 'Approval Time'];
    const rows = filteredRecords.map(record => [
      record.approved_by || 'Unknown',
      `${record.first_name} ${record.middle_name || ''} ${record.surname}`.trim(),
      formatDate(record.approval_date),
      formatDateTime(record.approval_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '30px 40px', 
        marginBottom: '20px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>
              🔒 Approval Audit Log
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
              Developer-Only Access • Track all approval records
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '20px 30px', 
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Approver Name Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
              Approver Name
            </label>
            <select
              value={filters.approverName}
              onChange={(e) => setFilters({ ...filters, approverName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">All Approvers</option>
              {approverNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Search Applicant */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>
              Search Applicant
            </label>
            <input
              type="text"
              value={filters.searchApplicant}
              onChange={(e) => setFilters({ ...filters, searchApplicant: e.target.value })}
              placeholder="Search by name..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setFilters({ approverName: 'all', dateFrom: '', dateTo: '', searchApplicant: '' })}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Clear Filters
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredRecords.length === 0}
            style={{
              padding: '8px 16px',
              background: filteredRecords.length === 0 ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: filteredRecords.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #667eea'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Total Approvals</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{filteredRecords.length}</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #28a745'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Active Approvers</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{approverNames.length}</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ffc107'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Today's Approvals</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
            {filteredRecords.filter(r => {
              if (!r.approval_date) return false;
              const today = new Date().toDateString();
              const approvalDate = new Date(r.approval_date).toDateString();
              return today === approvalDate;
            }).length}
          </div>
        </div>
      </div>

      {/* Audit Records Table */}
      <div style={{ 
        background: 'white', 
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Approval Records ({filteredRecords.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading audit records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No approval records found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>
                    #
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>
                    Approver Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>
                    Applicant Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>
                    Approval Date & Time
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr 
                    key={record.id}
                    style={{ 
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {record.approved_by || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: '#333', fontWeight: 500 }}>
                      {record.first_name} {record.middle_name || ''} {record.surname} {record.suffix || ''}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#666' }}>
                      {formatDateTime(record.approval_date)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: '#d4edda',
                        color: '#155724',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        ✓ APPROVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
