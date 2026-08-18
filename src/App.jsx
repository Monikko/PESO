import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ApplicantForm from './applicants/ApplicantForm';
import EditApplicantFlow from './applicants/EditApplicantFlow';
import LoginPage from './auth/LoginPage';
import AdminNameSelection from './auth/AdminNameSelection';
import AdminDashboard from './admin/AdminDashboard';
import AuditLog from './admin/AuditLog';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showNameSelection, setShowNameSelection] = useState(false);
  const [adminName, setAdminName] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        setSession(existingSession);
        const userEmail = existingSession.user.email;
        
        // Try to restore admin name from session storage (only works if tab wasn't closed)
        const savedAdminName = sessionStorage.getItem('admin_name');
        
        setUser({
          email: userEmail,
          role: userEmail === 'pesopalayancity002@gmail.com' ? 'admin' : 'user',
          supabaseUser: existingSession.user,
          adminName: savedAdminName || null
        });
        
        if (savedAdminName) {
          setAdminName(savedAdminName);
        } else if (userEmail === 'pesopalayancity002@gmail.com') {
          // If admin but no name saved, show name selection
          setShowNameSelection(true);
        }
      }
      
      // Check for secret audit log URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('audit') === 'dev2024') {
        setShowAuditLog(true);
      }
      
      // Show loading screen for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsLoading(false);
    };

    initializeApp();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setUser({
          email: session.user.email,
          role: session.user.email === 'pesopalayancity002@gmail.com' ? 'admin' : 'user',
          supabaseUser: session.user
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-logout when tab/window is closed
  useEffect(() => {
    // Mark that the app is running in this tab
    sessionStorage.setItem('app_active', 'true');

    const handleBeforeUnload = async () => {
      // Sign out from Supabase when tab is closing
      if (session) {
        // Clear session storage
        sessionStorage.removeItem('app_active');
        sessionStorage.removeItem('admin_name');
        
        // Sign out from Supabase
        await supabase.auth.signOut();
      }
    };

    // Listen for tab close/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up on unmount
      sessionStorage.removeItem('app_active');
    };
  }, [session]);

  const handleLogin = async (credentials) => {
    // After successful Supabase auth, show name selection
    setShowNameSelection(true);
    setShowAdminLogin(false);
  };

  const handleNameSelection = (name) => {
    setAdminName(name);
    setShowNameSelection(false);
    // Save admin name to session storage (clears on tab close)
    sessionStorage.setItem('admin_name', name);
    // Update user object with admin name
    setUser(prevUser => ({
      ...prevUser,
      adminName: name
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setAdminName(null);
    setShowAdminLogin(false);
    setShowNameSelection(false);
    // Clear session storage
    sessionStorage.removeItem('admin_name');
    sessionStorage.removeItem('app_active');
  };

  const [adminIntent, setAdminIntent] = useState(null);
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);

  const handleAdminAccess = (intent = null) => {
    setAdminIntent(intent);
    setShowAdminLogin(true);
  };

  const handleBackToHome = () => {
    setShowAdminLogin(false);
    setAdminIntent(null);
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show audit log if secret URL is accessed
  if (showAuditLog) {
    return <AuditLog onBack={() => {
      setShowAuditLog(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }} />;
  }

  // Show name selection after login (before dashboard)
  if (showNameSelection) {
    return (
      <AdminNameSelection 
        onSelectName={handleNameSelection}
        onBack={() => {
          setShowNameSelection(false);
          handleLogout();
        }}
      />
    );
  }

  // If admin is logged in AND has selected name, show admin dashboard
  if (session && user?.role === 'admin' && adminName) {
    if (adminIntent?.type === 'edit_applicant') {
      return (
        <EditApplicantFlow
          applicantData={adminIntent.applicant}
          onComplete={async (updatedApplicantId) => {
            // Refresh the applicant in the dashboard before logging out
            if (adminIntent.onEditComplete && updatedApplicantId) {
              await adminIntent.onEditComplete(updatedApplicantId);
            }
            if (adminIntent.autoLogout) {
              await handleLogout();
            } else {
              // Admin Dashboard edit — trigger re-fetch
              setAdminRefreshKey(k => k + 1);
            }
            setAdminIntent(null);
          }}
        />
      );
    }
    return <AdminDashboard user={user} adminName={adminName} onLogout={handleLogout} refreshKey={adminRefreshKey} onEditApplicant={(app) => setAdminIntent({ type: 'edit_applicant', applicant: app, autoLogout: false })} />;
  }

  // If showing admin login page
  if (showAdminLogin && !session) {
    return <LoginPage onLogin={handleLogin} onBack={handleBackToHome} />;
  }

  // Default: Show applicant registration form (public access)
  return (
    <div>
      <ApplicantForm user={user} onLogout={handleLogout} onAdminAccess={handleAdminAccess} />
    </div>
  );
}

export default App;
