import { supabase } from './supabase.js';

// Map DB snake_case row to app camelCase object
function toApp(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    country: row.country,
    agreedToTerms: row.agreed_to_terms,
    agreedAt: row.agreed_at,
    industries: row.industries ?? [],
    jobTitles: row.job_titles ?? [],
    setupComplete: row.setup_complete,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map app camelCase object to DB snake_case row
function toDb(profile) {
  const row = {};
  if (profile.id !== undefined) row.id = profile.id;
  if (profile.firstName !== undefined) row.first_name = profile.firstName;
  if (profile.lastName !== undefined) row.last_name = profile.lastName;
  if (profile.country !== undefined) row.country = profile.country;
  if (profile.agreedToTerms !== undefined) row.agreed_to_terms = profile.agreedToTerms;
  if (profile.agreedAt !== undefined) row.agreed_at = profile.agreedAt;
  if (profile.industries !== undefined) row.industries = profile.industries;
  if (profile.jobTitles !== undefined) row.job_titles = profile.jobTitles;
  if (profile.setupComplete !== undefined) row.setup_complete = profile.setupComplete;
  return row;
}

const profileService = {
  async getProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data ? toApp(data) : null;
  },

  async createProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(toDb(profile))
      .select()
      .single();
    if (error) throw error;
    return toApp(data);
  },

  async updateProfile(profile) {
    const row = toDb(profile);
    delete row.id; // Don't update the PK
    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', profile.id)
      .select()
      .single();
    if (error) throw error;
    return toApp(data);
  },
};

export default profileService;
