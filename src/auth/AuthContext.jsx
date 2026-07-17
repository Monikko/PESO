import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: Check for mock auth
    const mockAuth = window.localStorage.getItem('mockAuth');
    if (mockAuth === 'true') {
      setUser({ email: 'mock@user.com', id: 'mock-user' });
      setLoading(false);
      return;
    }

    // No mock auth, set user to null and stop loading
    setUser(null);
    setLoading(false);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    }).catch((error) => {
      console.error('Session check error:', error);
      setUser(null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password (NO EMAIL VERIFICATION)
  const signUp = async (email, password) => {
    // First, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (signUpError) {
      return { data: signUpData, error: signUpError };
    }
    
    // Immediately sign in after signup (works even if email confirmation is required)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data: signInData || signUpData, error: signInError };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    try {
      // TEMPORARY: Clear mock auth
      window.localStorage.removeItem('mockAuth');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state and reload regardless of errors
      setUser(null);
      // Force a hard reload to the root
      window.location.replace('/');
    }
  };

  // Resend verification email
  const resendVerification = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
