import { supabase } from './supabase.js';

// Map DB snake_case row to app camelCase object
function toApp(row) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    stage: row.stage,
    dateApplied: row.date_applied ?? '',
    todos: row.todos ?? [],
    notes: row.notes ?? '',
    resumeId: row.resume_id ?? null,
  };
}

// Map app camelCase object to DB snake_case row
function toDb(job) {
  const row = {
    company: job.company,
    role: job.role,
    stage: job.stage,
    date_applied: job.dateApplied || null,
    todos: job.todos ?? [],
    notes: job.notes || null,
    resume_id: job.resumeId ?? null,
  };
  if (job.id) row.id = job.id;
  return row;
}

const supabaseAdapter = {
  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toApp);
  },

  async save(job) {
    if (job.id) {
      // Update existing job
      const { data, error } = await supabase
        .from('jobs')
        .update(toDb(job))
        .eq('id', job.id)
        .select()
        .single();
      if (error) throw error;
      return toApp(data);
    } else {
      // Insert new job (DB generates UUID + sets user_id)
      const { data, error } = await supabase
        .from('jobs')
        .insert(toDb(job))
        .select()
        .single();
      if (error) throw error;
      return toApp(data);
    }
  },

  async remove(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async saveAll(newJobs) {
    // Merge: insert only jobs that don't already exist
    const existing = await this.getAll();
    const existingIds = new Set(existing.map((j) => j.id));
    const toInsert = newJobs.filter((j) => !existingIds.has(j.id));

    if (toInsert.length > 0) {
      const rows = toInsert.map((j) => {
        const row = toDb(j);
        delete row.id; // Let DB generate new UUIDs for imported jobs
        delete row.resume_id; // Resume IDs are not portable across users
        return row;
      });
      const { error } = await supabase.from('jobs').insert(rows);
      if (error) throw error;
    }
    return this.getAll();
  },

  async replaceAll(jobs) {
    // Delete all user's jobs (RLS scopes to current user)
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .gte('created_at', '1970-01-01');
    if (deleteError) throw deleteError;

    if (jobs.length > 0) {
      const rows = jobs.map((j) => {
        const row = toDb(j);
        delete row.id; // Let DB generate new UUIDs
        delete row.resume_id; // Resume IDs are not portable across users
        return row;
      });
      const { error: insertError } = await supabase.from('jobs').insert(rows);
      if (insertError) throw insertError;
    }
  },

  async exportAll() {
    return this.getAll();
  },
};

export default supabaseAdapter;
