import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check for admin credentials
    const isAdmin = email === 'admin01@gmail.com' && password === 'admin';

    // For admin, skip other validations
    if (isAdmin) {
      onLogin({ email, password, role: 'admin' });
      return;
    }

    // Validate email contains @gmail.com (for regular users)
    if (!email.includes('@gmail.com')) {
      setError('Email must be a Gmail address (@gmail.com)');
      return;
    }

    // Validate password is not empty
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // If sign up, check passwords match
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Simple validation passed - proceed to login as regular user
    onLogin({ email, password, role: 'user' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PESO Palayan City</h1>
          <p>Applicant Registration System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          )}

          <div className="show-password-wrapper">
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <span>Show password</span>
            </label>
          </div>

          <button type="submit" className="login-btn">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="toggle-mode">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(false)} className="link-btn">
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsSignUp(true)} className="link-btn">
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
