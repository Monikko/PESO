import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './LoginPage.css';

const LoginPage = ({ onLogin, onBack }) => {
  const [email] = useState('pesopalayancity002@gmail.com'); // Pre-filled admin email (read-only)
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin Sign In with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Success - admin is now logged in
      onLogin({ email, role: 'admin' });
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PESO Palayan City</h1>
          <p>Admin Dashboard Login</p>
        </div>

        {onBack && (
          <button type="button" onClick={onBack} className="back-btn">
            ← Back to Applicant Form
          </button>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                backgroundColor: '#f0f0f0',
                cursor: 'not-allowed',
                color: '#333',
                fontWeight: 600
              }}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '0.85rem' }}>
              Official PESO Palayan City admin account
            </small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
