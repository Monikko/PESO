-- Supabase Schema for Project PESO
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Step 1: Personal Information
  photo_url TEXT,
  surname TEXT,
  first_name TEXT,
  middle_name TEXT,
  suffix TEXT,
  date_of_birth DATE,
  sex TEXT,
  civil_status TEXT,
  height DECIMAL,
  religion TEXT,
  barangay TEXT,
  city_municipality TEXT,
  province TEXT,
  region TEXT,
  email TEXT,
  contact_number TEXT,
  landline TEXT,
  
  -- Step 2: Employment Status
  employment_status TEXT,
  employment_type TEXT,
  
  -- Step 3: Applicant Classification
  is_4ps_beneficiary BOOLEAN,
  household_id TEXT,
  classification JSONB,
  
  -- Step 4: Job Preferences
  preferred_occupation TEXT[],
  preferred_work_location TEXT[],
  expected_salary_min DECIMAL,
  expected_salary_max DECIMAL,
  passports JSONB,
  overseas_location TEXT,
  
  -- Step 5: Language/Dialects
  languages JSONB,
  
  -- Step 6: Educational Background
  elementary_school TEXT,
  elementary_course TEXT,
  elementary_year_graduated INTEGER,
  elementary_level TEXT,
  elementary_awards TEXT,
  secondary_school TEXT,
  secondary_course TEXT,
  secondary_year_graduated INTEGER,
  secondary_level TEXT,
  secondary_awards TEXT,
  tertiary_school TEXT,
  tertiary_course TEXT,
  tertiary_year_graduated INTEGER,
  tertiary_level TEXT,
  tertiary_awards TEXT,
  graduate_school TEXT,
  graduate_course TEXT,
  graduate_year_graduated INTEGER,
  graduate_level TEXT,
  graduate_awards TEXT,
  
  -- Step 7: Certification/Training
  vocational_courses JSONB,
  
  -- Step 8: Eligibility/License
  eligibilities JSONB,
  
  -- Step 9: Work Experience
  work_experiences JSONB,
  
  -- Step 10: Other Skills
  other_skills JSONB,
  
  -- Step 11: Registration Details
  actively_looking_for_work BOOLEAN,
  willing_to_work_immediately BOOLEAN,
  four_ps_beneficiary BOOLEAN,
  willing_to_work_any_location BOOLEAN,
  preferred_work_locations TEXT[],
  is_employed BOOLEAN,
  employment_tenure TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_applicants_created_at ON applicants(created_at DESC);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_status ON applicants(status);

-- Enable Row Level Security
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON applicants
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all records
CREATE POLICY "Allow authenticated users to read" ON applicants
  FOR SELECT TO authenticated
  USING (true);

-- Create policy to allow authenticated users to update records
CREATE POLICY "Allow authenticated users to update" ON applicants
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete records
CREATE POLICY "Allow authenticated users to delete" ON applicants
  FOR DELETE TO authenticated
  USING (true);

-- Create storage bucket for applicant files (photos, documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-files', 'applicant-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for uploads
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'applicant-files');

-- Storage policy for public access
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'applicant-files');

-- Storage policy for authenticated delete
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'applicant-files');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for basic applicant info (for listing pages)
CREATE OR REPLACE VIEW applicants_summary AS
SELECT 
  id,
  created_at,
  surname,
  first_name,
  middle_name,
  email,
  contact_number,
  status,
  preferred_occupation,
  employment_status
FROM applicants
ORDER BY created_at DESC;
