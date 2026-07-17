import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

/**
 * Example Admin Component - Applicants List
 * This demonstrates how to fetch and display applicants from Supabase
 */
const ApplicantsList = () => {
  const { getApplicants, loading, error } = useSupabase();
  const [applicants, setApplicants] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch applicants on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    const { data, error } = await getApplicants();
    if (data) {
      setApplicants(data);
    }
  };

  // Filter applicants by status
  const filteredApplicants = filter === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === filter);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Applicants Management</h1>

      {/* Filter Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          onClick={fetchApplicants}
          style={{ marginLeft: '10px', padding: '8px 16px', borderRadius: '4px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && <p>Loading applicants...</p>}

      {/* Error State */}
      {error && (
        <div style={{ padding: '10px', background: '#fee', color: 'red', borderRadius: '4px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {/* Applicants Count */}
      <p style={{ marginBottom: '20px' }}>
        Showing {filteredApplicants.length} of {applicants.length} applicants
      </p>

      {/* Applicants Table */}
      {!loading && filteredApplicants.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Employment</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>
                    {applicant.surname}, {applicant.first_name} {applicant.middle_name}
                  </td>
                  <td style={{ padding: '12px' }}>{applicant.email}</td>
                  <td style={{ padding: '12px' }}>{applicant.contact_number}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: applicant.status === 'pending' ? '#ffc107' : applicant.status === 'approved' ? '#28a745' : '#dc3545',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {applicant.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{applicant.employment_status}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(applicant.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredApplicants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No applicants found
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;
