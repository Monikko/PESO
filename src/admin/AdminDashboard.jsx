import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminDashboard.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('palayan');
  const [palayanData, setPalayanData] = useState([]);
  const [otherPlacesData, setOtherPlacesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPalayan, setTotalPalayan] = useState(0);
  const [totalOther, setTotalOther] = useState(0);
  
  // Full applicant data for tables
  const [palayanApplicants, setPalayanApplicants] = useState([]);
  const [otherApplicants, setOtherApplicants] = useState([]);
  
  // Filters for Palayan tab
  const [palayanFilters, setPalayanFilters] = useState({
    sortBy: 'latest',
    searchName: '',
    barangay: 'all',
    gender: 'all',
    ageRange: 'all',
    status: 'all'
  });
  
  // Filters for Other Places tab
  const [otherFilters, setOtherFilters] = useState({
    sortBy: 'latest',
    searchName: '',
    municipality: 'all',
    gender: 'all',
    ageRange: 'all',
    status: 'all'
  });
  
  // New: Employment and Gender Statistics
  const [employmentStats, setEmploymentStats] = useState({
    employed: 0,
    unemployed: 0,
    male: 0,
    female: 0
  });

  // Age Statistics
  const [ageStats, setAgeStats] = useState({
    age18AndBelow: 0,
    age19to25: 0,
    age26to35: 0,
    age36to50: 0,
    age51AndAbove: 0
  });

  // Colors for pie chart slices
  const COLORS = [
    '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
    '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#FFA07A',
    '#87CEEB', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Function to approve an applicant (mark as hired)
  const handleApprove = async (applicantId, applicantName) => {
    if (!confirm(`Approve and mark ${applicantName} as HIRED?`)) {
      return;
    }

    try {
      console.log('Approving applicant:', applicantId);
      console.log('Attempting to update approved_by_admin to TRUE');
      
      const { data, error } = await supabase
        .from('applicants')
        .update({ 
          approved_by_admin: true,
          approval_date: new Date().toISOString()
        })
        .eq('id', applicantId)
        .select();

      if (error) {
        console.error('❌ Approval error:', error);
        console.error('Error code:', error.code);
        console.error('Error hint:', error.hint);
        console.error('Error details:', error.details);
        
        // Check if it's an RLS error
        if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501') {
          alert(`⚠️ Database Permission Error!\n\nRow Level Security (RLS) is blocking the update.\n\nFix:\n1. Go to Supabase Dashboard\n2. Table Editor → applicants table\n3. Click "RLS" button at top\n4. Either disable RLS OR add a policy for UPDATE\n\nError: ${error.message}`);
        } else {
          alert(`Error approving applicant: ${error.message}`);
        }
        return;
      }

      console.log('✅ Approval successful:', data);
      console.log('Updated record:', data);
      alert(`${applicantName} has been approved and marked as HIRED!`);
      
      // Refresh data
      console.log('Refreshing data...');
      await fetchData();
      console.log('Data refresh complete');
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Function to unapprove an applicant
  const handleUnapprove = async (applicantId, applicantName) => {
    if (!confirm(`Remove approval for ${applicantName}?`)) {
      return;
    }

    try {
      console.log('Unapproving applicant:', applicantId);
      
      const { data, error } = await supabase
        .from('applicants')
        .update({ 
          approved_by_admin: false,
          approval_date: null
        })
        .eq('id', applicantId)
        .select();

      if (error) {
        console.error('Unapproval error:', error);
        alert(`Error removing approval: ${error.message}`);
        return;
      }

      console.log('Unapproval successful:', data);
      alert(`Approval removed for ${applicantName}`);
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all applicants (use correct column names from Step11.jsx)
      // Note: date_of_birth column might not exist yet if no one has registered with date of birth
      const { data, error } = await supabase
        .from('applicants')
        .select('id, barangay, city_municipality, province, employment_status, sex, date_of_birth, surname, first_name, middle_name, created_at, resume_url, approved_by_admin');

      if (error) {
        console.error('Supabase error:', error);
        
        // If dob column doesn't exist, try without it
        if (error.message?.includes('date_of_birth') && error.message?.includes('does not exist')) {
          console.warn('Column "date_of_birth" does not exist yet. Fetching without age data...');
          
          const { data: dataWithoutDob, error: error2 } = await supabase
            .from('applicants')
            .select('id, barangay, city_municipality, province, employment_status, sex, surname, first_name, middle_name, created_at, resume_url, approved_by_admin');
          
          if (error2) {
            console.error('Second fetch error:', error2);
            handleDatabaseError(error2);
            setLoading(false);
            return;
          }
          
          // Process data without age statistics
          processApplicantData(dataWithoutDob, false);
          setLoading(false);
          return;
        }
        
        handleDatabaseError(error);
        setLoading(false);
        return;
      }

      // Process data with age statistics
      processApplicantData(data, true);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error loading dashboard data:\n\n${error.message}`);
      setPalayanData([]);
      setOtherPlacesData([]);
      setTotalPalayan(0);
      setTotalOther(0);
      setEmploymentStats({ employed: 0, unemployed: 0, male: 0, female: 0 });
      setAgeStats({ age18AndBelow: 0, age19to25: 0, age26to35: 0, age36to50: 0, age51AndAbove: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseError = (error) => {
        
        // Check if it's an RLS error
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          alert(`Database Access Error:\n\nRow Level Security (RLS) is blocking access.\n\nPlease go to Supabase Dashboard:\n1. Go to Table Editor → applicants table\n2. Click "RLS" button\n3. Disable RLS or add a policy for SELECT\n\nError: ${error.message}`);
        } else if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          alert(`Database Error:\n\nThe "applicants" table doesn't exist yet.\n\nPlease:\n1. Register at least one applicant first\n2. Or create the table in Supabase\n\nError: ${error.message}`);
        } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          alert(`Database Error:\n\nColumn mismatch detected.\n\nThe table structure might be outdated.\nTry registering a new applicant to update the table.\n\nError: ${error.message}`);
        } else {
          alert(`Error loading dashboard data:\n\n${error.message}\n\nCheck console for details.`);
        }
        
        // Set empty data so dashboard still shows
        setPalayanData([]);
        setOtherPlacesData([]);
        setTotalPalayan(0);
        setTotalOther(0);
        setEmploymentStats({ employed: 0, unemployed: 0, male: 0, female: 0 });
        setAgeStats({ age18AndBelow: 0, age19to25: 0, age26to35: 0, age36to50: 0, age51AndAbove: 0 });
  };

  const processApplicantData = (data, includeAge) => {
      if (!data || data.length === 0) {
        console.log('No applicants found in database');
        setPalayanData([]);
        setOtherPlacesData([]);
        setTotalPalayan(0);
        setTotalOther(0);
        setEmploymentStats({ employed: 0, unemployed: 0, male: 0, female: 0 });
        setAgeStats({ age18AndBelow: 0, age19to25: 0, age26to35: 0, age36to50: 0, age51AndAbove: 0 });
        setLoading(false);
        return;
      }

      // Calculate employment and gender statistics
      let employedCount = 0;
      let unemployedCount = 0;
      let maleCount = 0;
      let femaleCount = 0;

      // Age statistics
      let age18AndBelowCount = 0;
      let age19to25Count = 0;
      let age26to35Count = 0;
      let age36to50Count = 0;
      let age51AndAboveCount = 0;

      // Helper function to calculate age from date of birth
      const calculateAge = (dob) => {
        // Handle empty, null, or placeholder values
        if (!dob || dob === '--' || dob === '' || dob.includes('--')) return null;
        
        try {
          const birthDate = new Date(dob);
          
          // Check if date is valid
          if (isNaN(birthDate.getTime())) return null;
          
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        } catch (error) {
          console.error('Error calculating age from dob:', dob, error);
          return null;
        }
      };

      data.forEach(app => {
        // New logic: Everyone is "seeking employment" unless approved by admin
        // "employed" status from Step3 doesn't mean they're hired - just their current status
        
        if (app.approved_by_admin === true) {
          employedCount++;  // Only count as employed if admin approved (hired)
        } else {
          unemployedCount++;  // Everyone else is seeking employment
        }

        // Gender
        if (app.sex?.toUpperCase() === 'MALE') {
          maleCount++;
        } else if (app.sex?.toUpperCase() === 'FEMALE') {
          femaleCount++;
        }

        // Age calculation - Debug logging
        if (includeAge) {
          console.log('date_of_birth value:', app.date_of_birth, 'Type:', typeof app.date_of_birth);
        }
        
        const age = calculateAge(app.date_of_birth);
        if (includeAge && age !== null) {
          console.log('Calculated age:', age);
        }
        
        if (age !== null) {
          if (age <= 18) {
            age18AndBelowCount++;
          } else if (age >= 19 && age <= 25) {
            age19to25Count++;
          } else if (age >= 26 && age <= 35) {
            age26to35Count++;
          } else if (age >= 36 && age <= 50) {
            age36to50Count++;
          } else if (age >= 51) {
            age51AndAboveCount++;
          }
        }
      });

      setEmploymentStats({
        employed: employedCount,
        unemployed: unemployedCount,
        male: maleCount,
        female: femaleCount
      });

      setAgeStats({
        age18AndBelow: age18AndBelowCount,
        age19to25: age19to25Count,
        age26to35: age26to35Count,
        age36to50: age36to50Count,
        age51AndAbove: age51AndAboveCount
      });

      // Separate Palayan City and Others
      const palayanApplicantsList = data.filter(
        app => app.city_municipality?.toUpperCase().includes('PALAYAN')
      );
      const otherApplicantsList = data.filter(
        app => !app.city_municipality?.toUpperCase().includes('PALAYAN')
      );

      // Store full applicant lists
      setPalayanApplicants(palayanApplicantsList);
      setOtherApplicants(otherApplicantsList);

      console.log('Palayan applicants list:', palayanApplicantsList);
      console.log('Other applicants list:', otherApplicantsList);
      console.log('Palayan applicants count:', palayanApplicantsList.length);
      console.log('Other applicants count:', otherApplicantsList.length);
      console.log('Sample applicant approved status:', palayanApplicantsList[0]?.approved_by_admin);

      // Group Palayan by barangay
      const palayanGrouped = palayanApplicantsList.reduce((acc, app) => {
        const barangay = app.barangay || 'Unknown';
        acc[barangay] = (acc[barangay] || 0) + 1;
        return acc;
      }, {});

      // Group Others by city/municipality
      const otherGrouped = otherApplicantsList.reduce((acc, app) => {
        const city = app.city_municipality || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {});

      // Convert to array format for charts
      const palayanChartData = Object.entries(palayanGrouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const otherChartData = Object.entries(otherGrouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setPalayanData(palayanChartData);
      setOtherPlacesData(otherChartData);
      setTotalPalayan(palayanApplicantsList.length);
      setTotalOther(otherApplicantsList.length);
      
      console.log(`Loaded: ${palayanApplicantsList.length} Palayan applicants, ${otherApplicantsList.length} other applicants`);
      console.log(`Employment: ${employedCount} employed, ${unemployedCount} unemployed`);
      console.log(`Gender: ${maleCount} male, ${femaleCount} female`);
      console.log(`Age: ${age18AndBelowCount} (≤18), ${age19to25Count} (19-25), ${age26to35Count} (26-35), ${age36to50Count} (36-50), ${age51AndAboveCount} (51+)`);
  };

  // Helper: Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob || dob === '--' || dob === '' || dob.includes('--')) return null;
    
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return null;
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return null;
    }
  };

  // Helper: Get unique barangays from Palayan applicants
  const getUniqueBarangays = () => {
    const barangays = [...new Set(palayanApplicants.map(app => app.barangay).filter(Boolean))];
    return barangays.sort();
  };

  // Helper: Get unique municipalities from other applicants
  const getUniqueMunicipalities = () => {
    const municipalities = [...new Set(otherApplicants.map(app => app.city_municipality).filter(Boolean))];
    return municipalities.sort();
  };

  // Helper: Filter and sort applicants
  const filterAndSortApplicants = (applicants, filters) => {
    let filtered = [...applicants];

    // Filter by name
    if (filters.searchName) {
      const searchLower = filters.searchName.toLowerCase();
      filtered = filtered.filter(app => {
        const fullName = `${app.surname || ''} ${app.first_name || ''} ${app.middle_name || ''}`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    // Filter by barangay (for Palayan)
    if (filters.barangay && filters.barangay !== 'all') {
      filtered = filtered.filter(app => app.barangay === filters.barangay);
    }

    // Filter by municipality (for Other Places)
    if (filters.municipality && filters.municipality !== 'all') {
      filtered = filtered.filter(app => app.city_municipality === filters.municipality);
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(app => app.sex?.toUpperCase() === filters.gender.toUpperCase());
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'approved') {
        filtered = filtered.filter(app => app.approved_by_admin === true);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(app => app.approved_by_admin !== true);
      }
    }

    // Filter by age range
    if (filters.ageRange && filters.ageRange !== 'all') {
      filtered = filtered.filter(app => {
        const age = calculateAge(app.date_of_birth);
        if (age === null) return false;
        
        switch (filters.ageRange) {
          case '18-below': return age <= 18;
          case '19-25': return age >= 19 && age <= 25;
          case '26-35': return age >= 26 && age <= 35;
          case '36-50': return age >= 36 && age <= 50;
          case '51-above': return age >= 51;
          default: return true;
        }
      });
    }

    // Sort
    if (filters.sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.surname || ''} ${a.first_name || ''}`.toLowerCase();
        const nameB = `${b.surname || ''} ${b.first_name || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return filtered;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.03) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Job Seekers Monitoring System</p>
        </div>
        <div className="admin-user-section">
          <div className="admin-user-info">
            <span className="admin-badge">ADMIN</span>
            <span className="admin-email">{user?.email}</span>
          </div>
          <button onClick={onLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'palayan' ? 'active' : ''}`}
          onClick={() => setActiveTab('palayan')}
        >
          Palayan City (Per Barangay)
        </button>
        <button
          className={`admin-tab ${activeTab === 'other' ? 'active' : ''}`}
          onClick={() => setActiveTab('other')}
        >
          Other Places (Per Municipality)
        </button>
        <button
          className={`admin-tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Employment & Demographics
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'palayan' && (
              <div className="chart-section">
                <div className="chart-header">
                  <h2>List of Job Seekers per Barangay</h2>
                  <div className="total-count">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{totalPalayan}</span>
                  </div>
                </div>
                
                <div className="chart-container">
                  {palayanData.length > 0 ? (
                    <>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={500}>
                          <PieChart>
                            <Pie
                              data={palayanData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomLabel}
                              outerRadius={180}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {palayanData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                              layout="vertical" 
                              align="right" 
                              verticalAlign="middle"
                              iconType="circle"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="data-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Barangay</th>
                              <th>Job Seekers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {palayanData.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      <p>No data available for Palayan City</p>
                    </div>
                  )}
                </div>

                {/* Applicants List Table */}
                {palayanData.length > 0 && (
                  <div className="applicants-list-section">
                    <h3>Registered Applicants - Palayan City</h3>
                    
                    {/* Filters */}
                    <div className="filters-bar">
                      <div className="filter-group">
                        <label>Sort By:</label>
                        <select 
                          value={palayanFilters.sortBy}
                          onChange={(e) => setPalayanFilters({...palayanFilters, sortBy: e.target.value})}
                          className="filter-select"
                        >
                          <option value="latest">Latest Registration</option>
                          <option value="name">Name (A-Z)</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Search Name:</label>
                        <input 
                          type="text"
                          placeholder="Search by name..."
                          value={palayanFilters.searchName}
                          onChange={(e) => setPalayanFilters({...palayanFilters, searchName: e.target.value})}
                          className="filter-input"
                        />
                      </div>

                      <div className="filter-group">
                        <label>Barangay:</label>
                        <select 
                          value={palayanFilters.barangay}
                          onChange={(e) => setPalayanFilters({...palayanFilters, barangay: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Barangays</option>
                          {getUniqueBarangays().map(brgy => (
                            <option key={brgy} value={brgy}>{brgy}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Gender:</label>
                        <select 
                          value={palayanFilters.gender}
                          onChange={(e) => setPalayanFilters({...palayanFilters, gender: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Age Range:</label>
                        <select 
                          value={palayanFilters.ageRange}
                          onChange={(e) => setPalayanFilters({...palayanFilters, ageRange: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Ages</option>
                          <option value="18-below">18 & Below</option>
                          <option value="19-25">19-25</option>
                          <option value="26-35">26-35</option>
                          <option value="36-50">36-50</option>
                          <option value="51-above">51+</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Status:</label>
                        <select 
                          value={palayanFilters.status}
                          onChange={(e) => setPalayanFilters({...palayanFilters, status: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    {/* Applicants Table */}
                    <div className="applicants-table-container">
                      <table className="applicants-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Barangay</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Resume</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterAndSortApplicants(palayanApplicants, palayanFilters).map((applicant, index) => {
                            const age = calculateAge(applicant.date_of_birth);
                            const registrationDate = applicant.created_at 
                              ? new Date(applicant.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : 'N/A';
                            
                            const fullName = `${applicant.surname || ''}, ${applicant.first_name || ''} ${applicant.middle_name || ''}`.trim();
                            const isApproved = applicant.approved_by_admin === true;
                            
                            return (
                              <tr key={applicant.id}>
                                <td>{index + 1}</td>
                                <td className="name-cell">{fullName}</td>
                                <td>{applicant.barangay || 'N/A'}</td>
                                <td>
                                  <span className={`gender-badge ${applicant.sex?.toLowerCase()}`}>
                                    {applicant.sex || 'N/A'}
                                  </span>
                                </td>
                                <td>{age !== null ? age : 'N/A'}</td>
                                <td>
                                  {isApproved ? (
                                    <span className="status-badge approved">✓ Approved</span>
                                  ) : (
                                    <span className="status-badge pending">Pending</span>
                                  )}
                                </td>
                                <td>{registrationDate}</td>
                                <td>
                                  {applicant.resume_url ? (
                                    <a 
                                      href={applicant.resume_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="resume-link"
                                      download
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                      </svg>
                                      Download
                                    </a>
                                  ) : (
                                    <span className="no-resume">No Resume</span>
                                  )}
                                </td>
                                <td>
                                  {isApproved ? (
                                    <button 
                                      className="action-btn unapprove-btn"
                                      onClick={() => handleUnapprove(applicant.id, fullName)}
                                      title="Remove approval"
                                    >
                                      Unapprove
                                    </button>
                                  ) : (
                                    <button 
                                      className="action-btn approve-btn"
                                      onClick={() => handleApprove(applicant.id, fullName)}
                                      title="Approve and mark as hired"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filterAndSortApplicants(palayanApplicants, palayanFilters).length === 0 && (
                        <div className="no-results">No applicants match the selected filters</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'other' && (
              <div className="chart-section">
                <div className="chart-header">
                  <h2>List of Job Seekers per Municipality</h2>
                  <div className="total-count">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{totalOther}</span>
                  </div>
                </div>
                
                <div className="chart-container">
                  {otherPlacesData.length > 0 ? (
                    <>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={500}>
                          <PieChart>
                            <Pie
                              data={otherPlacesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomLabel}
                              outerRadius={180}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {otherPlacesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                              layout="vertical" 
                              align="right" 
                              verticalAlign="middle"
                              iconType="circle"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="data-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Municipality/City</th>
                              <th>Job Seekers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {otherPlacesData.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      <p>No data available for other places</p>
                    </div>
                  )}
                </div>

                {/* Applicants List Table */}
                {otherPlacesData.length > 0 && (
                  <div className="applicants-list-section">
                    <h3>Registered Applicants - Other Municipalities</h3>
                    
                    {/* Filters */}
                    <div className="filters-bar">
                      <div className="filter-group">
                        <label>Sort By:</label>
                        <select 
                          value={otherFilters.sortBy}
                          onChange={(e) => setOtherFilters({...otherFilters, sortBy: e.target.value})}
                          className="filter-select"
                        >
                          <option value="latest">Latest Registration</option>
                          <option value="name">Name (A-Z)</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Search Name:</label>
                        <input 
                          type="text"
                          placeholder="Search by name..."
                          value={otherFilters.searchName}
                          onChange={(e) => setOtherFilters({...otherFilters, searchName: e.target.value})}
                          className="filter-input"
                        />
                      </div>

                      <div className="filter-group">
                        <label>Municipality:</label>
                        <select 
                          value={otherFilters.municipality}
                          onChange={(e) => setOtherFilters({...otherFilters, municipality: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Municipalities</option>
                          {getUniqueMunicipalities().map(muni => (
                            <option key={muni} value={muni}>{muni}</option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Gender:</label>
                        <select 
                          value={otherFilters.gender}
                          onChange={(e) => setOtherFilters({...otherFilters, gender: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Age Range:</label>
                        <select 
                          value={otherFilters.ageRange}
                          onChange={(e) => setOtherFilters({...otherFilters, ageRange: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Ages</option>
                          <option value="18-below">18 & Below</option>
                          <option value="19-25">19-25</option>
                          <option value="26-35">26-35</option>
                          <option value="36-50">36-50</option>
                          <option value="51-above">51+</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Status:</label>
                        <select 
                          value={otherFilters.status}
                          onChange={(e) => setOtherFilters({...otherFilters, status: e.target.value})}
                          className="filter-select"
                        >
                          <option value="all">All Status</option>
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    {/* Applicants Table */}
                    <div className="applicants-table-container">
                      <table className="applicants-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Municipality</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Resume</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterAndSortApplicants(otherApplicants, otherFilters).map((applicant, index) => {
                            const age = calculateAge(applicant.date_of_birth);
                            const registrationDate = applicant.created_at 
                              ? new Date(applicant.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : 'N/A';
                            
                            const fullName = `${applicant.surname || ''}, ${applicant.first_name || ''} ${applicant.middle_name || ''}`.trim();
                            const isApproved = applicant.approved_by_admin === true;
                            
                            return (
                              <tr key={applicant.id}>
                                <td>{index + 1}</td>
                                <td className="name-cell">{fullName}</td>
                                <td>{applicant.city_municipality || 'N/A'}</td>
                                <td>
                                  <span className={`gender-badge ${applicant.sex?.toLowerCase()}`}>
                                    {applicant.sex || 'N/A'}
                                  </span>
                                </td>
                                <td>{age !== null ? age : 'N/A'}</td>
                                <td>
                                  {isApproved ? (
                                    <span className="status-badge approved">✓ Approved</span>
                                  ) : (
                                    <span className="status-badge pending">Pending</span>
                                  )}
                                </td>
                                <td>{registrationDate}</td>
                                <td>
                                  {applicant.resume_url ? (
                                    <a 
                                      href={applicant.resume_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="resume-link"
                                      download
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                      </svg>
                                      Download
                                    </a>
                                  ) : (
                                    <span className="no-resume">No Resume</span>
                                  )}
                                </td>
                                <td>
                                  {isApproved ? (
                                    <button 
                                      className="action-btn unapprove-btn"
                                      onClick={() => handleUnapprove(applicant.id, fullName)}
                                      title="Remove approval"
                                    >
                                      Unapprove
                                    </button>
                                  ) : (
                                    <button 
                                      className="action-btn approve-btn"
                                      onClick={() => handleApprove(applicant.id, fullName)}
                                      title="Approve and mark as hired"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filterAndSortApplicants(otherApplicants, otherFilters).length === 0 && (
                        <div className="no-results">No applicants match the selected filters</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="chart-section">
                <div className="chart-header">
                  <h2>Employment Status & Demographics Analysis</h2>
                  <div className="total-count">
                    <span className="total-label">Total Registrants:</span>
                    <span className="total-value">{totalPalayan + totalOther}</span>
                  </div>
                </div>
                
                <div className="statistics-container">
                  {/* Executive Summary */}
                  <div className="executive-summary">
                    <h3>📊 Executive Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Employment Rate:</span>
                        <span className="summary-value success">
                          {((employmentStats.employed / (employmentStats.employed + employmentStats.unemployed) || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Unemployment Rate:</span>
                        <span className="summary-value warning">
                          {((employmentStats.unemployed / (employmentStats.employed + employmentStats.unemployed) || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Gender Ratio (M:F):</span>
                        <span className="summary-value info">
                          {employmentStats.male}:{employmentStats.female}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Active Job Seekers:</span>
                        <span className="summary-value primary">
                          {employmentStats.unemployed.toLocaleString()}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Youth Applicants (≤18):</span>
                        <span className="summary-value youth">
                          {ageStats.age18AndBelow.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Performance Indicators */}
                  <div className="kpi-section">
                    <h3>📈 Key Performance Indicators</h3>
                    <div className="stats-cards">
                      <div className="stat-card employed">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                          <div className="stat-label">Approved (Hired)</div>
                          <div className="stat-value">{employmentStats.employed.toLocaleString()}</div>
                          <div className="stat-percentage">
                            {((employmentStats.employed / (employmentStats.employed + employmentStats.unemployed) || 0) * 100).toFixed(1)}% of total registrants
                          </div>
                          <div className="stat-description">
                            Applicants approved and hired by admin
                          </div>
                        </div>
                      </div>

                      <div className="stat-card unemployed">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                          <div className="stat-label">Seeking Employment</div>
                          <div className="stat-value">{employmentStats.unemployed.toLocaleString()}</div>
                          <div className="stat-percentage">
                            {((employmentStats.unemployed / (employmentStats.employed + employmentStats.unemployed) || 0) * 100).toFixed(1)}% awaiting approval
                          </div>
                          <div className="stat-description">
                            Pending review and approval by admin
                          </div>
                        </div>
                      </div>

                      <div className="stat-card male">
                        <div className="stat-icon">👨</div>
                        <div className="stat-content">
                          <div className="stat-label">Male Registrants</div>
                          <div className="stat-value">{employmentStats.male.toLocaleString()}</div>
                          <div className="stat-percentage">
                            {((employmentStats.male / (employmentStats.male + employmentStats.female) || 0) * 100).toFixed(1)}% of total population
                          </div>
                          <div className="stat-description">
                            Male job seekers registered in system
                          </div>
                        </div>
                      </div>

                      <div className="stat-card female">
                        <div className="stat-icon">👩</div>
                        <div className="stat-content">
                          <div className="stat-label">Female Registrants</div>
                          <div className="stat-value">{employmentStats.female.toLocaleString()}</div>
                          <div className="stat-percentage">
                            {((employmentStats.female / (employmentStats.male + employmentStats.female) || 0) * 100).toFixed(1)}% of total population
                          </div>
                          <div className="stat-description">
                            Female job seekers registered in system
                          </div>
                        </div>
                      </div>

                      <div className="stat-card youth">
                        <div className="stat-icon">👶</div>
                        <div className="stat-content">
                          <div className="stat-label">Youth Applicants (18 & Below)</div>
                          <div className="stat-value">{ageStats.age18AndBelow.toLocaleString()}</div>
                          <div className="stat-percentage">
                            {((ageStats.age18AndBelow / (totalPalayan + totalOther) || 0) * 100).toFixed(1)}% of total registrants
                          </div>
                          <div className="stat-description">
                            Requires youth employment programs
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Insights */}
                  <div className="insights-section">
                    <h3>💡 Key Insights & Recommendations</h3>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-icon">📊</div>
                        <div className="insight-content">
                          <h4>Approval Status</h4>
                          <p>
                            {employmentStats.unemployed > employmentStats.employed 
                              ? `${((employmentStats.unemployed / (employmentStats.employed + employmentStats.unemployed)) * 100).toFixed(0)}% of applicants are pending approval. Review applications and approve qualified candidates for employment.`
                              : `Approval rate is at ${((employmentStats.employed / (employmentStats.employed + employmentStats.unemployed)) * 100).toFixed(0)}%, indicating successful hiring and placement.`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon">⚖️</div>
                        <div className="insight-content">
                          <h4>Gender Balance</h4>
                          <p>
                            {Math.abs(employmentStats.male - employmentStats.female) / (employmentStats.male + employmentStats.female) > 0.1
                              ? `There is a ${Math.abs(((employmentStats.male - employmentStats.female) / (employmentStats.male + employmentStats.female)) * 100).toFixed(0)}% gender gap. Programs should be developed to encourage participation from ${employmentStats.male > employmentStats.female ? 'female' : 'male'} job seekers.`
                              : `Gender distribution is well-balanced, with near-equal representation of male and female registrants.`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon">🎯</div>
                        <div className="insight-content">
                          <h4>Strategic Focus</h4>
                          <p>
                            With {employmentStats.unemployed.toLocaleString()} active job seekers, the PESO office should prioritize: (1) Strengthening partnerships with local employers, (2) Conducting regular job fairs, and (3) Providing skills development programs.
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon">📍</div>
                        <div className="insight-content">
                          <h4>Geographic Coverage</h4>
                          <p>
                            System has registered {totalPalayan.toLocaleString()} applicants from Palayan City and {totalOther.toLocaleString()} from surrounding areas, demonstrating {totalOther > 0 ? 'regional reach beyond city boundaries' : 'primary focus on local residents'}.
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon">👶</div>
                        <div className="insight-content">
                          <h4>Youth Employment Focus</h4>
                          <p>
                            {ageStats.age18AndBelow > 0 
                              ? `There are ${ageStats.age18AndBelow.toLocaleString()} registrants aged 18 and below (${((ageStats.age18AndBelow / (totalPalayan + totalOther)) * 100).toFixed(1)}% of total). Youth-focused programs and entry-level opportunities should be prioritized for this demographic.`
                              : 'No registrants aged 18 and below. Consider outreach programs to engage younger job seekers.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytical Charts */}
                  <div className="analytics-section">
                    <h3>📉 Statistical Analysis</h3>
                    <div className="charts-row">
                      <div className="chart-box">
                        <h4>Employment Status Distribution</h4>
                        <p className="chart-subtitle">Breakdown of current employment status among all registrants</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Approved (Hired)', value: employmentStats.employed },
                                { name: 'Seeking Employment', value: employmentStats.unemployed }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomLabel}
                              outerRadius={100}
                              dataKey="value"
                            >
                              <Cell fill="#27ae60" />
                              <Cell fill="#e67e22" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-footer">
                          <strong>Total Registrants:</strong> {(employmentStats.employed + employmentStats.unemployed).toLocaleString()}
                        </div>
                      </div>

                      <div className="chart-box">
                        <h4>Gender Demographics</h4>
                        <p className="chart-subtitle">Male-to-female ratio analysis of registered job seekers</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Male', value: employmentStats.male },
                                { name: 'Female', value: employmentStats.female }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomLabel}
                              outerRadius={100}
                              dataKey="value"
                            >
                              <Cell fill="#3498db" />
                              <Cell fill="#e74c3c" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-footer">
                          <strong>Gender Ratio:</strong> {employmentStats.male}M : {employmentStats.female}F
                        </div>
                      </div>

                      <div className="chart-box">
                        <h4>Age Distribution</h4>
                        <p className="chart-subtitle">Age bracket analysis of all registered job seekers</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: '18 & Below', value: ageStats.age18AndBelow },
                                { name: '19-25', value: ageStats.age19to25 },
                                { name: '26-35', value: ageStats.age26to35 },
                                { name: '36-50', value: ageStats.age36to50 },
                                { name: '51+', value: ageStats.age51AndAbove }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomLabel}
                              outerRadius={100}
                              dataKey="value"
                            >
                              <Cell fill="#9b59b6" />
                              <Cell fill="#3498db" />
                              <Cell fill="#2ecc71" />
                              <Cell fill="#f39c12" />
                              <Cell fill="#e74c3c" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-footer">
                          <strong>Youth (≤18):</strong> {ageStats.age18AndBelow.toLocaleString()} | <strong>Working Age (19-50):</strong> {(ageStats.age19to25 + ageStats.age26to35 + ageStats.age36to50).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Footer */}
                  <div className="report-footer">
                    <div className="footer-item">
                      <strong>Report Generated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="footer-item">
                      <strong>Data Source:</strong> PESO Palayan City Registration Database
                    </div>
                    <div className="footer-item">
                      <strong>Coverage:</strong> All registered job seekers in the system
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
