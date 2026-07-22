import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ApplicantForm from './applicants/ApplicantForm';
import LoginPage from './auth/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        setSession(existingSession);
        setUser({
          email: existingSession.user.email,
          role: existingSession.user.email === 'admin01@gmail.com' ? 'admin' : 'user',
          supabaseUser: existingSession.user
        });
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
          role: session.user.email === 'admin01@gmail.com' ? 'admin' : 'user',
          supabaseUser: session.user
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (credentials) => {
    // This function is no longer needed - LoginPage handles auth directly
    // Keeping for compatibility
    return true;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Route based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Default: regular user
  return (
    <div>
      <ApplicantForm user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
