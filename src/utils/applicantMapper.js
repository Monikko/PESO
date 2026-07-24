export const mapApplicantToFormData = (applicant) => {
  // Map flat applicant database record to the nested formData structure expected by the multi-step form

  return {
    id: applicant.id, // Keep track of the ID for updating
    // Step 1
    firstName: applicant.first_name || '',
    middleName: applicant.middle_name || '',
    lastName: applicant.surname || '',
    suffix: applicant.suffix || 'NONE',
    dob: applicant.date_of_birth || '',
    sex: applicant.sex || '',

    // Step 2
    step2: {
      civilStatus: applicant.civil_status || '',
      barangay: applicant.barangay || '',
      city: applicant.city_municipality || '',
      province: applicant.province || '',
      email: applicant.email || '',
      cellphone: applicant.contact_number || '',
      landline: applicant.landline || '',
      heightCm: applicant.height ? applicant.height.toString() : '',
      religion: applicant.religion || '',
      is4ps: applicant.is_4ps_beneficiary || false,
      householdId: applicant.household_id || ''
    },

    // Step 3
    step3: {
      employmentStatus: applicant.employment_status || '',
      subStatus: applicant.employment_type || ''
    },

    // Step 4
    step4: {
      occupations: (applicant.preferred_occupation || []).map(occ => ({ occupation: occ })),
      localLocations: (applicant.preferred_work_location || []).filter(loc => loc && !loc.includes('Overseas')),
      overseasLocations: (applicant.preferred_work_location || []).filter(loc => loc && loc.includes('Overseas'))
    },

    // Step 5
    step5: {
      languages: applicant.languages || []
    },

    // Step 6 (Education)
    step6: {
      records: [
        ...(applicant.elementary_school ? [{
          educationLevel: 'ELEMENTARY',
          school: applicant.elementary_school,
          course: applicant.elementary_course || '',
          yearGraduated: applicant.elementary_year_graduated?.toString() || ''
        }] : []),
        ...(applicant.secondary_school ? [{
          educationLevel: 'SECONDARY / HIGH SCHOOL',
          school: applicant.secondary_school,
          course: applicant.secondary_course || '',
          yearGraduated: applicant.secondary_year_graduated?.toString() || ''
        }] : []),
        ...(applicant.tertiary_school ? [{
          educationLevel: 'TERTIARY / COLLEGE',
          school: applicant.tertiary_school,
          course: applicant.tertiary_course || '',
          yearGraduated: applicant.tertiary_year_graduated?.toString() || ''
        }] : [])
      ]
    },

    // Step 7 (Certifications/Trainings)
    step7: {
      certifications: applicant.vocational_courses?.certifications || [],
      trainings: applicant.vocational_courses?.trainings || []
    },

    // Step 8 (Eligibility/Licenses)
    step8: {
      eligibilities: applicant.eligibilities?.eligibilities || [],
      licenses: applicant.eligibilities?.licenses || []
    },

    // Step 9 (Work Experience)
    step9: {
      workExperiences: applicant.work_experiences || []
    },

    // Step 10 (Other Skills)
    step10: {
      selectedSkills: applicant.other_skills || []
    },

    // Step 11 (Registration Details)
    step11: {
      remarks: applicant.notes || '',
      registrationDate: applicant.created_at ? applicant.created_at.split('T')[0] : ''
    }
  };
};

export const mapFormDataToApplicant = (globalFormData) => {
  return {
    // Personal Information (Step 1)
    surname: globalFormData.lastName,
    first_name: globalFormData.firstName,
    middle_name: globalFormData.middleName,
    suffix: globalFormData.suffix === 'NONE' ? null : globalFormData.suffix,
    date_of_birth: globalFormData.dob || null,
    sex: globalFormData.sex,

    // Personal Information (Step 2)
    civil_status: globalFormData.step2?.civilStatus,
    barangay: globalFormData.step2?.barangay,
    city_municipality: globalFormData.step2?.city,
    province: globalFormData.step2?.province,
    email: globalFormData.step2?.email,
    contact_number: globalFormData.step2?.cellphone,
    landline: globalFormData.step2?.landline,
    height: globalFormData.step2?.heightCm ? parseFloat(globalFormData.step2.heightCm) : null,
    religion: globalFormData.step2?.religion,
    is_4ps_beneficiary: globalFormData.step2?.is4ps || false,
    household_id: globalFormData.step2?.householdId,

    // Employment Status (Step 3)
    employment_status: globalFormData.step3?.employmentStatus,
    employment_type: globalFormData.step3?.subStatus,

    // Job Preferences (Step 4)
    preferred_occupation: globalFormData.step4?.occupations?.map(o => o.occupation) || [],
    preferred_work_location: [
      ...(globalFormData.step4?.localLocations || []),
      ...(globalFormData.step4?.overseasLocations || [])
    ],

    // Language/Dialects (Step 5)
    languages: globalFormData.step5?.languages || [],

    // Educational Background (Step 6)
    elementary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.school,
    elementary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.course,
    elementary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('ELEMENTARY'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('ELEMENTARY')).yearGraduated) : null,
    
    secondary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.school,
    secondary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.course,
    secondary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('HIGH SCHOOL') || r.educationLevel?.includes('SECONDARY')).yearGraduated) : null,
    
    tertiary_school: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.school,
    tertiary_course: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.course,
    tertiary_year_graduated: globalFormData.step6?.records?.find(r => r.educationLevel?.includes('COLLEGE'))?.yearGraduated ? parseInt(globalFormData.step6.records.find(r => r.educationLevel?.includes('COLLEGE')).yearGraduated) : null,

    // Certification/Training (Step 7)
    vocational_courses: {
      certifications: globalFormData.step7?.certifications || [],
      trainings: globalFormData.step7?.trainings || []
    },

    // Eligibility/License (Step 8)
    eligibilities: {
      eligibilities: globalFormData.step8?.eligibilities || [],
      licenses: globalFormData.step8?.licenses || []
    },

    // Work Experience (Step 9)
    work_experiences: globalFormData.step9?.workExperiences || [],

    // Other Skills (Step 10)
    other_skills: globalFormData.step10?.selectedSkills || [],

    // Registration Details (Step 11)
    notes: globalFormData.step11?.remarks || ''
  };
};
