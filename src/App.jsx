import React, { useState, useEffect } from 'react';
import ApplicantForm from './applicants/ApplicantForm';
import LoginPage from './auth/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    // Simulate initial app loading
    const initializeApp = async () => {
      // Check stored user
      const storedUser = localStorage.getItem('pesoUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
      
      // Show loading screen for 3 seconds (adjust as needed)
      // To see loading screen again: Press Ctrl+Shift+R or clear browser cache
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = (credentials) => {
    // Store user info in localStorage
    const userData = {
      email: credentials.email,
      role: credentials.role || 'user',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('pesoUser', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pesoUser');
    setUser(null);
    setIsLoggedIn(false);
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
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
