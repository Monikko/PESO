/**
 * Supabase Helper Functions
 * Common operations for working with the Supabase database
 */

import { supabase } from './supabase';

/**
 * Transform form data to match database schema
 * Maps frontend field names to database column names
 */
export const transformFormDataForDB = (formData) => {
  return {
    // Personal Information
    photo_url: formData.photoUrl,
    surname: formData.step1?.surname,
    first_name: formData.step1?.firstName,
    middle_name: formData.step1?.middleName,
    suffix: formData.step1?.suffix,
    date_of_birth: formData.step1?.dateOfBirth,
    sex: formData.step1?.sex,
    civil_status: formData.step1?.civilStatus,
    height: formData.step1?.height,
    religion: formData.step1?.religion,
    barangay: formData.step1?.barangay,
    city_municipality: formData.step1?.cityMunicipality,
    province: formData.step1?.province,
    region: formData.step1?.region,
    email: formData.step1?.email,
    contact_number: formData.step1?.contactNumber,
    landline: formData.step1?.landline,

    // Employment
    employment_status: formData.step2?.employmentStatus,
    employment_type: formData.step2?.employmentType,

    // Classification
    is_4ps_beneficiary: formData.step3?.is4PsBeneficiary,
    household_id: formData.step3?.householdId,
    classification: formData.step3?.classification,

    // Job Preferences
    preferred_occupation: formData.step4?.preferredOccupation,
    preferred_work_location: formData.step4?.preferredWorkLocation,
    expected_salary_min: formData.step4?.expectedSalaryMin,
    expected_salary_max: formData.step4?.expectedSalaryMax,
    passports: formData.step4?.passports,
    overseas_location: formData.step4?.overseasLocation,

    // Languages
    languages: formData.step5?.languages,

    // Education
    elementary_school: formData.step6?.elementarySchool,
    elementary_course: formData.step6?.elementaryCourse,
    elementary_year_graduated: formData.step6?.elementaryYearGraduated,
    elementary_level: formData.step6?.elementaryLevel,
    elementary_awards: formData.step6?.elementaryAwards,
    secondary_school: formData.step6?.secondarySchool,
    secondary_course: formData.step6?.secondaryCourse,
    secondary_year_graduated: formData.step6?.secondaryYearGraduated,
    secondary_level: formData.step6?.secondaryLevel,
    secondary_awards: formData.step6?.secondaryAwards,
    tertiary_school: formData.step6?.tertiarySchool,
    tertiary_course: formData.step6?.tertiaryCourse,
    tertiary_year_graduated: formData.step6?.tertiaryYearGraduated,
    tertiary_level: formData.step6?.tertiaryLevel,
    tertiary_awards: formData.step6?.tertiaryAwards,
    graduate_school: formData.step6?.graduateSchool,
    graduate_course: formData.step6?.graduateCourse,
    graduate_year_graduated: formData.step6?.graduateYearGraduated,
    graduate_level: formData.step6?.graduateLevel,
    graduate_awards: formData.step6?.graduateAwards,

    // Certifications
    vocational_courses: formData.step7?.vocationalCourses,

    // Eligibility
    eligibilities: formData.step8?.eligibilities,

    // Work Experience
    work_experiences: formData.step9?.workExperiences,

    // Skills
    other_skills: formData.step10?.otherSkills,

    // Registration
    ...formData.step11,

    // Status
    status: 'pending'
  };
};

/**
 * Query builders for common database operations
 */

// Get applicants with filters
export const getApplicantsWithFilters = async (filters = {}) => {
  let query = supabase.from('applicants').select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.employment_status) {
    query = query.eq('employment_status', filters.employment_status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  if (filters.search) {
    query = query.or(`surname.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  return { data, error };
};

// Get applicant statistics
export const getApplicantStats = async () => {
  const { data, error } = await supabase
    .from('applicants')
    .select('status, employment_status');

  if (error) return { data: null, error };

  const stats = {
    total: data.length,
    byStatus: {},
    byEmploymentStatus: {}
  };

  data.forEach(applicant => {
    // Count by status
    stats.byStatus[applicant.status] = (stats.byStatus[applicant.status] || 0) + 1;
    
    // Count by employment status
    if (applicant.employment_status) {
      stats.byEmploymentStatus[applicant.employment_status] = 
        (stats.byEmploymentStatus[applicant.employment_status] || 0) + 1;
    }
  });

  return { data: stats, error: null };
};

// Batch update applicants
export const batchUpdateApplicants = async (ids, updates) => {
  const { data, error } = await supabase
    .from('applicants')
    .update(updates)
    .in('id', ids)
    .select();

  return { data, error };
};

// Export applicants to CSV format
export const exportApplicantsToCSV = async (filters = {}) => {
  const { data, error } = await getApplicantsWithFilters(filters);
  
  if (error) return { data: null, error };

  // Convert to CSV
  const headers = [
    'ID', 'Created At', 'Surname', 'First Name', 'Middle Name',
    'Email', 'Contact Number', 'Status', 'Employment Status'
  ];

  const rows = data.map(applicant => [
    applicant.id,
    applicant.created_at,
    applicant.surname,
    applicant.first_name,
    applicant.middle_name,
    applicant.email,
    applicant.contact_number,
    applicant.status,
    applicant.employment_status
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
  ].join('\n');

  return { data: csv, error: null };
};

/**
 * Realtime subscriptions
 */

// Subscribe to new applicants
export const subscribeToNewApplicants = (callback) => {
  const subscription = supabase
    .channel('new-applicants')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'applicants' 
      }, 
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Subscribe to applicant updates
export const subscribeToApplicantUpdates = (applicantId, callback) => {
  const subscription = supabase
    .channel(`applicant-${applicantId}`)
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'applicants',
        filter: `id=eq.${applicantId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Unsubscribe from realtime updates
export const unsubscribe = (subscription) => {
  supabase.removeChannel(subscription);
};
