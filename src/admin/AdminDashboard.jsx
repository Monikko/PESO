import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import './AdminDashboard.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const AdminDashboard = ({ user, adminName, onLogout, onEditApplicant, refreshKey }) => {
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

  // Trend summary view mode (monthly or annual)
  const [trendSummaryMode, setTrendSummaryMode] = useState('monthly');

  // Occupation search state
  const [occupationSearch, setOccupationSearch] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: '', // 'approve' or 'unapprove'
    applicantId: null,
    applicantName: '',
    processing: false
  });

  // Result modal state
  const [resultModal, setResultModal] = useState({
    show: false,
    success: true,
    title: '',
    message: ''
  });

  // Colors for pie chart slices
  const COLORS = [
    '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
    '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#FFA07A',
    '#87CEEB', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE'
  ];

  // Process data for the Palayan line graph — reacts to trendSummaryMode
  const palayanTrendData = useMemo(() => {
    if (!palayanApplicants.length) return [];

    const grouped = {};

    palayanApplicants.forEach(app => {
      if (!app.created_at) return;

      const date = new Date(app.created_at);
      if (isNaN(date.getTime())) return;

      let key;
      let label;

      if (trendSummaryMode === 'monthly') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        key = `${year}-${month}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        label = `${monthName} ${year}`;
      } else {
        key = `${date.getFullYear()}`;
        label = key;
      }

      if (!grouped[key]) {
        grouped[key] = {
          name: label,
          sortKey: key,
          Hired: 0,
          'Seeking Employment': 0
        };
      }

      if (app.approved_by_admin === true) {
        grouped[key].Hired += 1;
      } else {
        grouped[key]['Seeking Employment'] += 1;
      }
    });

    // Convert to array and sort chronologically
    return Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [palayanApplicants, trendSummaryMode]);

  // Compute top 10 desired occupations from Palayan applicants
  const palayanTop10Occupations = useMemo(() => {
    if (!palayanApplicants.length) return [];
    const counts = {};
    palayanApplicants.forEach(app => {
      const occs = app.preferred_occupation;
      if (!occs) return;
      const list = Array.isArray(occs) ? occs : [occs];
      list.forEach(occ => {
        if (!occ || typeof occ !== 'string') return;
        const key = occ.trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [palayanApplicants]);

  // Compute ALL occupations with counts (for search)
  const palayanAllOccupations = useMemo(() => {
    if (!palayanApplicants.length) return [];
    const counts = {};
    palayanApplicants.forEach(app => {
      const occs = app.preferred_occupation;
      if (!occs) return;
      const list = Array.isArray(occs) ? occs : [occs];
      list.forEach(occ => {
        if (!occ || typeof occ !== 'string') return;
        const key = occ.trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [palayanApplicants]);

  // Filtered occupations based on search query
  const filteredOccupations = useMemo(() => {
    if (!occupationSearch.trim()) return palayanAllOccupations;
    const q = occupationSearch.toLowerCase();
    return palayanAllOccupations.filter(o => o.name.toLowerCase().includes(q));
  }, [palayanAllOccupations, occupationSearch]);

  // Process data for the Palayan summary table
  const palayanSummaryData = useMemo(() => {
    if (!palayanApplicants.length) return [];

    const grouped = {};

    palayanApplicants.forEach(app => {
      if (!app.created_at) return;

      const date = new Date(app.created_at);
      if (isNaN(date.getTime())) return;

      let key;
      let displayLabel;

      if (trendSummaryMode === 'monthly') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        key = `${year}-${month}`;
        displayLabel = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
      } else {
        key = `${date.getFullYear()}`;
        displayLabel = key;
      }

      if (!grouped[key]) {
        grouped[key] = {
          sortKey: key,
          period: displayLabel,
          hired: 0,
          seeking: 0,
          total: 0
        };
      }

      grouped[key].total += 1;
      if (app.approved_by_admin === true) {
        grouped[key].hired += 1;
      } else {
        grouped[key].seeking += 1;
      }
    });

    // Convert to array and sort reverse chronologically (newest first)
    return Object.values(grouped).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [palayanApplicants, trendSummaryMode]);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Function to open the approve confirmation modal
  const handleApprove = (applicantId, applicantName) => {
    setConfirmModal({
      show: true,
      type: 'approve',
      applicantId,
      applicantName,
      processing: false
    });
  };

  // Function to actually process the approval
  const processApproval = async () => {
    const { applicantId, applicantName } = confirmModal;
    setConfirmModal(prev => ({ ...prev, processing: true }));

    try {
      const { data, error } = await supabase
        .from('applicants')
        .update({
          approved_by_admin: true,
          approval_date: new Date().toISOString(),
          approved_by: adminName || user.email // Track who approved
        })
        .eq('id', applicantId)
        .select();

      if (error) {
        console.error('Approval error:', error);
        setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
        setResultModal({
          show: true,
          success: false,
          title: 'Approval Failed',
          message: error.message?.includes('RLS') || error.message?.includes('policy') || error.code === '42501'
            ? 'Database Permission Error! Row Level Security (RLS) is blocking the update. Please check your Supabase RLS policies.'
            : `Error approving applicant: ${error.message}`
        });
        return;
      }

      if (data && data.length > 0 && data[0].approved_by_admin === true) {
        setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
        setResultModal({
          show: true,
          success: true,
          title: 'Applicant Approved!',
          message: `${applicantName} has been successfully approved and marked as HIRED.`
        });
      } else {
        setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
        setResultModal({
          show: true,
          success: false,
          title: 'Verification Failed',
          message: 'Approval command sent but status verification failed. Please refresh the page.'
        });
      }

      await fetchData();
    } catch (error) {
      console.error('Unexpected error:', error);
      setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
      setResultModal({
        show: true,
        success: false,
        title: 'Error',
        message: error.message
      });
    }
  };

  // Function to open the unapprove confirmation modal
  const handleUnapprove = (applicantId, applicantName) => {
    setConfirmModal({
      show: true,
      type: 'unapprove',
      applicantId,
      applicantName,
      processing: false
    });
  };

  // Function to actually process the unapproval
  const processUnapproval = async () => {
    const { applicantId, applicantName } = confirmModal;
    setConfirmModal(prev => ({ ...prev, processing: true }));

    try {
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
        setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
        setResultModal({
          show: true,
          success: false,
          title: 'Error',
          message: `Error removing approval: ${error.message}`
        });
        return;
      }

      setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
      setResultModal({
        show: true,
        success: true,
        title: 'Approval Removed',
        message: `Approval has been removed for ${applicantName}.`
      });

      await fetchData();
    } catch (error) {
      console.error('Unexpected error:', error);
      setConfirmModal(prev => ({ ...prev, show: false, processing: false }));
      setResultModal({
        show: true,
        success: false,
        title: 'Error',
        message: error.message
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all applicants (use correct column names from Step11.jsx)
      // Note: date_of_birth column might not exist yet if no one has registered with date of birth
      console.log('🔍 Fetching applicants from database...');
      const { data, error } = await supabase
        .from('applicants')
        .select('id, barangay, city_municipality, province, employment_status, sex, date_of_birth, surname, first_name, middle_name, suffix, created_at, resume_url, approved_by_admin, approval_date, preferred_occupation');

      if (error) {
        console.error('Supabase error:', error);

        // If dob column doesn't exist, try without it
        if (error.message?.includes('date_of_birth') && error.message?.includes('does not exist')) {
          console.warn('Column "date_of_birth" does not exist yet. Fetching without age data...');

          const { data: dataWithoutDob, error: error2 } = await supabase
            .from('applicants')
            .select('id, barangay, city_municipality, province, employment_status, sex, surname, first_name, middle_name, suffix, created_at, resume_url, approved_by_admin, approval_date, preferred_occupation');

          if (error2) {
            console.error('Second fetch error:', error2);
            handleDatabaseError(error2);
            setLoading(false);
            return;
          }

          console.log('✅ Fetched applicants (without DOB):', dataWithoutDob?.length);
          console.log('📊 Sample applicant approval status:', dataWithoutDob[0]?.approved_by_admin);

          // Process data without age statistics
          processApplicantData(dataWithoutDob, false);
          setLoading(false);
          return;
        }

        handleDatabaseError(error);
        setLoading(false);
        return;
      }

      console.log('✅ Fetched applicants:', data?.length);
      console.log('📊 Sample applicant data:', {
        id: data[0]?.id,
        name: `${data[0]?.first_name} ${data[0]?.surname}`,
        approved: data[0]?.approved_by_admin,
        approval_date: data[0]?.approval_date
      });

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
        const fullName = `${app.surname || ''} ${app.suffix ? app.suffix + ' ' : ''}${app.first_name || ''} ${app.middle_name || ''}`.toLowerCase();
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="admin-email" style={{ fontWeight: 600, fontSize: '1rem', color: '#2c3e50' }}>
                {adminName || 'Admin User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                {user?.email}
              </span>
            </div>
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
        <button
          className={`admin-tab ${activeTab === 'palayan-trend' ? 'active' : ''}`}
          onClick={() => setActiveTab('palayan-trend')}
        >
          Employment Status Over Time
          <span style={{ marginLeft: '6px', fontSize: '10px', background: '#e8f4fd', color: '#1a73e8', padding: '1px 6px', borderRadius: '10px', fontWeight: '600', verticalAlign: 'middle' }}>Palayan City</span>
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
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, sortBy: e.target.value })}
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
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, searchName: e.target.value })}
                          className="filter-input"
                        />
                      </div>

                      <div className="filter-group">
                        <label>Barangay:</label>
                        <select
                          value={palayanFilters.barangay}
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, barangay: e.target.value })}
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
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, gender: e.target.value })}
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
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, ageRange: e.target.value })}
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
                          onChange={(e) => setPalayanFilters({ ...palayanFilters, status: e.target.value })}
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

                            const fullName = `${applicant.surname || ''}, ${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.suffix || ''}`.trim();
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
                                  <div style={{ display: 'flex', gap: '8px' }}>
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
                                    <button
                                      className="action-btn edit-btn"
                                      onClick={() => onEditApplicant && onEditApplicant(applicant)}
                                      title="Edit Applicant"
                                      style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Edit
                                    </button>
                                  </div>
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
                          onChange={(e) => setOtherFilters({ ...otherFilters, sortBy: e.target.value })}
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
                          onChange={(e) => setOtherFilters({ ...otherFilters, searchName: e.target.value })}
                          className="filter-input"
                        />
                      </div>

                      <div className="filter-group">
                        <label>Municipality:</label>
                        <select
                          value={otherFilters.municipality}
                          onChange={(e) => setOtherFilters({ ...otherFilters, municipality: e.target.value })}
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
                          onChange={(e) => setOtherFilters({ ...otherFilters, gender: e.target.value })}
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
                          onChange={(e) => setOtherFilters({ ...otherFilters, ageRange: e.target.value })}
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
                          onChange={(e) => setOtherFilters({ ...otherFilters, status: e.target.value })}
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

                            const fullName = `${applicant.surname || ''}, ${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.suffix || ''}`.trim();
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
                                  <div style={{ display: 'flex', gap: '8px' }}>
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
                                    <button
                                      className="action-btn edit-btn"
                                      onClick={() => onEditApplicant && onEditApplicant(applicant)}
                                      title="Edit Applicant"
                                      style={{ background: '#f0ad4e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Edit
                                    </button>
                                  </div>
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
                    <h3>Key Performance Indicators</h3>
                    <div className="stats-cards">
                      <div className="stat-card employed">
                        <div className="stat-icon"></div>
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
                        <div className="stat-icon"></div>
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
                        <div className="stat-icon"></div>
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
                        <div className="stat-icon"></div>
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
                        <div className="stat-icon"></div>
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
                    <h3>Key Insights & Recommendations</h3>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-icon"></div>
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
                        <div className="insight-icon"></div>
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
                        <div className="insight-icon"></div>
                        <div className="insight-content">
                          <h4>Strategic Focus</h4>
                          <p>
                            With {employmentStats.unemployed.toLocaleString()} active job seekers, the PESO office should prioritize: (1) Strengthening partnerships with local employers, (2) Conducting regular job fairs, and (3) Providing skills development programs.
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon"></div>
                        <div className="insight-content">
                          <h4>Geographic Coverage</h4>
                          <p>
                            System has registered {totalPalayan.toLocaleString()} applicants from Palayan City and {totalOther.toLocaleString()} from surrounding areas, demonstrating {totalOther > 0 ? 'regional reach beyond city boundaries' : 'primary focus on local residents'}.
                          </p>
                        </div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-icon"></div>
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
                    <h3>Statistical Analysis</h3>
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
            {activeTab === 'palayan-trend' && (
              <div className="chart-section">
                <div className="chart-header">
                  <h2>
                    Hired vs. Job Seekers: {trendSummaryMode === 'monthly' ? 'Monthly' : 'Annual'} Employment Overview
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#1a73e8' }}></span>
                    Showing data for <strong>Palayan City applicants</strong>
                  </p>
                </div>

                {/* View By Toggle — controls both the graph and summary table */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '12px 20px 0' }}>
                  <label style={{ fontWeight: 600, color: '#555', fontSize: '0.9rem' }}>View by:</label>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f3f9', borderRadius: '10px', padding: '4px' }}>
                    <button
                      onClick={() => setTrendSummaryMode('monthly')}
                      style={{
                        padding: '6px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.88rem', transition: 'all 0.2s',
                        background: trendSummaryMode === 'monthly' ? '#1a73e8' : 'transparent',
                        color: trendSummaryMode === 'monthly' ? '#fff' : '#555'
                      }}
                    >Monthly</button>
                    <button
                      onClick={() => setTrendSummaryMode('annual')}
                      style={{
                        padding: '6px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
                        fontSize: '0.88rem', transition: 'all 0.2s',
                        background: trendSummaryMode === 'annual' ? '#1a73e8' : 'transparent',
                        color: trendSummaryMode === 'annual' ? '#fff' : '#555'
                      }}
                    >Annual</button>
                  </div>
                </div>

                <div className="chart-container" style={{ padding: '20px' }}>
                  {palayanTrendData.length > 0 ? (
                    <div className="chart-wrapper" style={{ marginTop: '20px' }}>
                      <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={palayanTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line type="monotone" dataKey="Hired" stroke="#3BA272" strokeWidth={3} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="Seeking Employment" stroke="#EE6666" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>No trend data available.</p>
                    </div>
                  )}
                </div>

                {/* Top 10 Occupations Bar Chart */}
                <div style={{ padding: '10px 20px 30px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '20px', borderTop: '2px solid #eee', paddingTop: '24px'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1a237e', fontWeight: 700 }}>
                        🏆 Top 10 Desired Occupations
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#777' }}>
                        Based on preferred occupations submitted by Palayan City applicants
                      </p>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                      color: '#fff', borderRadius: '20px',
                      padding: '4px 14px', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      Palayan City
                    </div>
                  </div>

                  {palayanTop10Occupations.length > 0 ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)',
                      borderRadius: '16px', padding: '24px 16px 16px',
                      boxShadow: '0 2px 16px rgba(26,35,126,0.08)', border: '1px solid #e3e8ff'
                    }}>
                      <ResponsiveContainer width="100%" height={420}>
                        <BarChart
                          data={palayanTop10Occupations}
                          margin={{ top: 20, right: 20, left: 0, bottom: 100 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dde3f0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#444', fontWeight: 500 }}
                            axisLine={{ stroke: '#ccc' }}
                            tickLine={false}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: '#555' }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'Applicants', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#888' }}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(26,35,126,0.06)' }}
                            contentStyle={{
                              borderRadius: '10px',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                              border: 'none',
                              fontSize: '0.88rem'
                            }}
                            formatter={(value) => [`${value} applicant${value !== 1 ? 's' : ''}`, 'Count']}
                          />
                          <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            label={{
                              position: 'top',
                              formatter: (v) => v,
                              fontSize: 12,
                              fill: '#3949ab',
                              fontWeight: 700
                            }}
                          >
                            {palayanTop10Occupations.map((_, index) => {
                              const gradient = [
                                '#3949ab', '#5c6bc0', '#7986cb', '#1a73e8',
                                '#1e88e5', '#039be5', '#0097a7', '#00897b',
                                '#43a047', '#7cb342'
                              ];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={gradient[index % gradient.length]}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      color: '#aaa', background: '#f9fafb',
                      borderRadius: '12px', border: '1px dashed #ddd'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>No occupation data available yet.</p>
                    </div>
                  )}
                </div>

                {/* Occupation Search Section */}
                <div style={{ padding: '10px 20px 30px' }}>
                  <div style={{ borderTop: '2px solid #eee', paddingTop: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1a237e', fontWeight: 700 }}>
                          🔍 Occupation Search
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#777' }}>
                          Search an occupation to view how many Palayan City applicants are seeking it
                        </p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                        color: '#fff', borderRadius: '20px',
                        padding: '4px 14px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        Palayan City
                      </div>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '1rem', color: '#888', pointerEvents: 'none'
                    }}>🔍</span>
                    <input
                      id="occupation-search-input"
                      type="text"
                      placeholder="Type an occupation (e.g. Teacher, Nurse, Driver…)"
                      value={occupationSearch}
                      onChange={e => { setOccupationSearch(e.target.value); setSelectedOccupation(null); }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '12px 16px 12px 42px',
                        borderRadius: '12px', border: '1.5px solid #c5cae9',
                        fontSize: '0.95rem', outline: 'none',
                        background: '#f8f9ff',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: '0 2px 8px rgba(26,35,126,0.06)'
                      }}
                      onFocus={e => { e.target.style.borderColor = '#3949ab'; e.target.style.boxShadow = '0 0 0 3px rgba(57,73,171,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = '#c5cae9'; e.target.style.boxShadow = '0 2px 8px rgba(26,35,126,0.06)'; }}
                    />
                    {occupationSearch && (
                      <button
                        onClick={() => { setOccupationSearch(''); setSelectedOccupation(null); }}
                        style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#aaa', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px'
                        }}
                        title="Clear search"
                      >✕</button>
                    )}
                  </div>

                  {/* Results Grid */}
                  {filteredOccupations.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '10px',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      padding: '4px 2px',
                    }}>
                      {filteredOccupations.map((occ, idx) => {
                        const isSelected = selectedOccupation && selectedOccupation.name === occ.name;
                        return (
                          <button
                            key={occ.name}
                            id={`occ-btn-${idx}`}
                            onClick={() => setSelectedOccupation(isSelected ? null : occ)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                              border: isSelected ? '2px solid #3949ab' : '1.5px solid #e3e8ff',
                              background: isSelected
                                ? 'linear-gradient(135deg, #3949ab, #5c6bc0)'
                                : 'linear-gradient(135deg, #f8f9ff, #eef2ff)',
                              color: isSelected ? '#fff' : '#333',
                              fontWeight: 600, fontSize: '0.88rem',
                              textAlign: 'left', transition: 'all 0.18s',
                              boxShadow: isSelected ? '0 4px 14px rgba(57,73,171,0.25)' : '0 1px 4px rgba(26,35,126,0.06)',
                              transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                            }}
                            onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#3949ab'; e.currentTarget.style.background = 'linear-gradient(135deg, #eef2ff, #dde3ff)'; } }}
                            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e3e8ff'; e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9ff, #eef2ff)'; } }}
                          >
                            <span style={{
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              maxWidth: '150px'
                            }} title={occ.name}>{occ.name}</span>
                            <span style={{
                              marginLeft: '8px', minWidth: '28px', height: '24px',
                              borderRadius: '20px', display: 'inline-flex',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 700,
                              background: isSelected ? 'rgba(255,255,255,0.25)' : '#3949ab',
                              color: isSelected ? '#fff' : '#fff',
                              padding: '0 8px'
                            }}>{occ.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center', padding: '32px 20px',
                      color: '#aaa', background: '#f9fafb',
                      borderRadius: '12px', border: '1px dashed #ddd'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔎</div>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        No occupations found{occupationSearch ? ` matching "${occupationSearch}"` : ''}.
                      </p>
                    </div>
                  )}

                  {/* Selected Occupation Detail */}
                  {selectedOccupation && (
                    <div style={{
                      marginTop: '20px',
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 60%, #5c6bc0 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(26,35,126,0.22)',
                      display: 'flex', alignItems: 'center', gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ fontSize: '2.8rem' }}>💼</div>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Selected Occupation · Palayan City
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '4px' }}>
                          {selectedOccupation.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                          Applicants actively seeking this role
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '120px' }}>
                        <div style={{
                          fontSize: '3.5rem', fontWeight: 900, lineHeight: 1,
                          textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>{selectedOccupation.count}</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px', fontWeight: 600 }}>
                          {selectedOccupation.count === 1 ? 'Applicant' : 'Applicants'}
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.65, marginTop: '2px' }}>
                          {palayanAllOccupations.length > 0
                            ? `${((selectedOccupation.count / palayanApplicants.length) * 100).toFixed(1)}% of Palayan applicants`
                            : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOccupation(null)}
                        style={{
                          alignSelf: 'flex-start', background: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                          borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: 600
                        }}
                      >✕ Close</button>
                    </div>
                  )}
                </div>

                {/* Summary Table Section */}
                <div style={{ padding: '10px 20px 30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderTop: '2px solid #eee', paddingTop: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>📊 Summary Table</h3>
                  </div>

                  {palayanSummaryData.length > 0 ? (
                    <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #eee' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                        <thead>
                          <tr style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', color: '#fff' }}>
                            <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.04em' }}>Period</th>
                            <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.04em' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3BA272', display: 'inline-block' }}></span>
                                Hired
                              </span>
                            </th>
                            <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.04em' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EE6666', display: 'inline-block' }}></span>
                                Seeking Employment
                              </span>
                            </th>
                            <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.04em' }}>Total Applicants</th>
                          </tr>
                        </thead>
                        <tbody>
                          {palayanSummaryData.map((row, idx) => (
                            <tr
                              key={row.sortKey}
                              style={{
                                background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f9fafb'}
                            >
                              <td style={{ padding: '12px 20px', fontWeight: 600, color: '#333' }}>{row.period}</td>
                              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                <span style={{ background: '#d4f4e8', color: '#1e7e50', padding: '3px 12px', borderRadius: '20px', fontWeight: 700 }}>
                                  {row.hired}
                                </span>
                              </td>
                              <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                <span style={{ background: '#fde8e8', color: '#c0392b', padding: '3px 12px', borderRadius: '20px', fontWeight: 700 }}>
                                  {row.seeking}
                                </span>
                              </td>
                              <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#444' }}>{row.total}</td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr style={{ background: '#f1f3f9', borderTop: '2px solid #ddd' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#222' }}>Grand Total</td>
                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                              <span style={{ background: '#3BA272', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontWeight: 700 }}>
                                {palayanSummaryData.reduce((sum, r) => sum + r.hired, 0)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                              <span style={{ background: '#EE6666', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontWeight: 700 }}>
                                {palayanSummaryData.reduce((sum, r) => sum + r.seeking, 0)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#222' }}>
                              {palayanSummaryData.reduce((sum, r) => sum + r.total, 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No summary data available.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="confirm-modal-overlay" onClick={() => !confirmModal.processing && setConfirmModal(prev => ({ ...prev, show: false }))}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-modal-icon ${confirmModal.type === 'approve' ? 'approve' : 'unapprove'}`}>
              {confirmModal.type === 'approve' ? '✓' : '✕'}
            </div>
            <h3 className="confirm-modal-title">
              {confirmModal.type === 'approve' ? 'Approve Applicant' : 'Remove Approval'}
            </h3>
            <p className="confirm-modal-message">
              {confirmModal.type === 'approve'
                ? <>Are you sure you want to approve and mark <strong>{confirmModal.applicantName}</strong> as <span style={{ color: '#27ae60', fontWeight: 700 }}>HIRED</span>?</>
                : <>Are you sure you want to remove approval for <strong>{confirmModal.applicantName}</strong>?</>
              }
            </p>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                disabled={confirmModal.processing}
              >
                Cancel
              </button>
              <button
                className={`confirm-modal-btn ${confirmModal.type === 'approve' ? 'approve' : 'unapprove'}`}
                onClick={() => confirmModal.type === 'approve' ? processApproval() : processUnapproval()}
                disabled={confirmModal.processing}
              >
                {confirmModal.processing
                  ? 'Processing...'
                  : confirmModal.type === 'approve' ? 'Yes, Approve' : 'Yes, Remove'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal.show && (
        <div className="confirm-modal-overlay" onClick={() => setResultModal(prev => ({ ...prev, show: false }))}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-modal-icon ${resultModal.success ? 'success' : 'error'}`}>
              {resultModal.success ? '✓' : '!'}
            </div>
            <h3 className="confirm-modal-title">{resultModal.title}</h3>
            <p className="confirm-modal-message">{resultModal.message}</p>
            {resultModal.success && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
                {new Date().toLocaleString()}
              </p>
            )}
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn approve"
                onClick={() => setResultModal(prev => ({ ...prev, show: false }))}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
