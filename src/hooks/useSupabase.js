import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit applicant form data
  const submitApplicant = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Insert the applicant data into your Supabase table
      const { data, error: supabaseError } = await supabase
        .from('applicants') // Replace with your actual table name
        .insert([formData])
        .select();

      if (supabaseError) throw supabaseError;
      
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  // Get all applicants
  const getApplicants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  // Get single applicant by ID
  const getApplicantById = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('applicants')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;
      
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  // Update applicant
  const updateApplicant = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('applicants')
        .update(updates)
        .eq('id', id)
        .select();

      if (supabaseError) throw supabaseError;
      
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  // Delete applicant
  const deleteApplicant = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: supabaseError } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setLoading(false);
      return { error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file, bucket = 'applicant-files') => {
    setLoading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setLoading(false);
      return { data: { path: filePath, url: publicUrl }, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err.message };
    }
  };

  return {
    loading,
    error,
    submitApplicant,
    getApplicants,
    getApplicantById,
    updateApplicant,
    deleteApplicant,
    uploadFile,
  };
};
