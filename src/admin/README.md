# Admin Components

This directory contains admin interface components for managing applicants.

## ApplicantsList Component

A basic example showing how to fetch and display applicants from Supabase.

### Usage

To use this component in your app, update `src/App.jsx`:

```jsx
import React, { useState } from 'react';
import ApplicantForm from './applicants/ApplicantForm';
import ApplicantsList from './admin/ApplicantsList';

function App() {
  const [view, setView] = useState('form'); // 'form' or 'admin'

  return (
    <div>
      {/* View Switcher */}
      <div style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => setView('form')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            background: view === 'form' ? '#007bff' : '#fff',
            color: view === 'form' ? '#fff' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Applicant Form
        </button>
        <button 
          onClick={() => setView('admin')}
          style={{ 
            padding: '8px 16px',
            background: view === 'admin' ? '#007bff' : '#fff',
            color: view === 'admin' ? '#fff' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Admin Panel
        </button>
      </div>

      {/* Content */}
      {view === 'form' ? <ApplicantForm /> : <ApplicantsList />}
    </div>
  );
}

export default App;
```

### Features

- Display all applicants in a table
- Filter by status (pending, approved, rejected)
- Refresh data
- Responsive design

### Extending the Admin Panel

Here are some features you might want to add:

#### 1. View Applicant Details

```jsx
import { useSupabase } from '../hooks/useSupabase';

const ApplicantDetails = ({ applicantId }) => {
  const { getApplicantById, loading } = useSupabase();
  const [applicant, setApplicant] = useState(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      const { data } = await getApplicantById(applicantId);
      setApplicant(data);
    };
    fetchApplicant();
  }, [applicantId]);

  if (loading) return <div>Loading...</div>;
  if (!applicant) return <div>Applicant not found</div>;

  return (
    <div>
      <h2>{applicant.first_name} {applicant.surname}</h2>
      {/* Display all applicant details */}
    </div>
  );
};
```

#### 2. Update Applicant Status

```jsx
const StatusUpdater = ({ applicantId, currentStatus }) => {
  const { updateApplicant, loading } = useSupabase();
  
  const handleStatusChange = async (newStatus) => {
    const { error } = await updateApplicant(applicantId, { status: newStatus });
    if (!error) {
      alert('Status updated successfully!');
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={loading}
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  );
};
```

#### 3. Search Functionality

```jsx
import { getApplicantsWithFilters } from '../lib/supabaseHelpers';

const SearchableList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const { data } = await getApplicantsWithFilters({ search: searchTerm });
    setResults(data);
  };

  return (
    <div>
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name or email"
      />
      <button onClick={handleSearch}>Search</button>
      {/* Display results */}
    </div>
  );
};
```

#### 4. Export to CSV

```jsx
import { exportApplicantsToCSV } from '../lib/supabaseHelpers';

const ExportButton = () => {
  const handleExport = async () => {
    const { data: csv } = await exportApplicantsToCSV();
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${Date.now()}.csv`;
    a.click();
  };

  return <button onClick={handleExport}>Export to CSV</button>;
};
```

#### 5. Real-time Updates

```jsx
import { subscribeToNewApplicants, unsubscribe } from '../lib/supabaseHelpers';

const RealtimeList = () => {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    // Subscribe to new applicants
    const subscription = subscribeToNewApplicants((newApplicant) => {
      setApplicants(prev => [newApplicant, ...prev]);
      // Show notification
      alert(`New applicant: ${newApplicant.first_name} ${newApplicant.surname}`);
    });

    // Cleanup on unmount
    return () => unsubscribe(subscription);
  }, []);

  return (
    <div>
      {applicants.map(applicant => (
        <div key={applicant.id}>{/* Display applicant */}</div>
      ))}
    </div>
  );
};
```

#### 6. Statistics Dashboard

```jsx
import { getApplicantStats } from '../lib/supabaseHelpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await getApplicantStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>Total Applicants: {stats.total}</div>
      <div>Pending: {stats.byStatus.pending || 0}</div>
      <div>Approved: {stats.byStatus.approved || 0}</div>
      <div>Rejected: {stats.byStatus.rejected || 0}</div>
    </div>
  );
};
```

## Authentication

For a production admin panel, you should add authentication:

### Setup Supabase Auth

```jsx
import { supabase } from '../lib/supabase';

// Sign up
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// Sign in
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

### Protected Route Example

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProtectedAdmin = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <LoginForm />; // Show login form
  }

  return children; // Show admin panel
};
```

## Best Practices

1. **Always handle loading states** - Show spinners or skeleton screens
2. **Handle errors gracefully** - Display user-friendly error messages
3. **Validate permissions** - Use RLS policies and check user roles
4. **Optimize queries** - Use pagination for large datasets
5. **Cache data** - Use React Query or similar for better performance
6. **Add confirmation dialogs** - Before deleting or updating important data

## Need Help?

- Check `src/hooks/useSupabase.js` for available database operations
- See `src/lib/supabaseHelpers.js` for advanced query examples
- Read [SUPABASE_SETUP.md](../../SUPABASE_SETUP.md) for database configuration
