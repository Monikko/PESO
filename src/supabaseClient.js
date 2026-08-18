import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with session-only storage (no persistent localStorage)
// This ensures the session clears when the browser tab is closed
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session in localStorage
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
