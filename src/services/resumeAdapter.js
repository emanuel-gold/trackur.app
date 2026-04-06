import { supabase } from './supabase.js';

// Map DB snake_case row to app camelCase object
function toApp(row) {
  return {
    id: row.id,
    userId: row.user_id,
    filename: row.filename,
    label: row.label ?? '',
    storagePath: row.storage_path,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

const resumeAdapter = {
  async getAll() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toApp);
  },

  async insert(resume, file) {
    // Get current user ID for storage path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a temp ID for the storage path
    const tempId = crypto.randomUUID();
    const storagePath = `${user.id}/${tempId}.pdf`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, { contentType: 'application/pdf' });
    if (uploadError) throw uploadError;

    // Insert DB row
    const { data, error: dbError } = await supabase
      .from('resumes')
      .insert({
        filename: resume.filename,
        label: resume.label || null,
        storage_path: storagePath,
        file_size: resume.fileSize,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up orphaned file if DB insert fails
      await supabase.storage.from('resumes').remove([storagePath]);
      throw dbError;
    }

    return toApp(data);
  },

  async updateLabel(id, label) {
    const { data, error } = await supabase
      .from('resumes')
      .update({ label: label || null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toApp(data);
  },

  async remove(id) {
    // Get storage path before deleting the row
    const { data: row, error: fetchError } = await supabase
      .from('resumes')
      .select('storage_path')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    // Delete DB row (triggers ON DELETE SET NULL on jobs)
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;

    // Remove file from storage
    await supabase.storage.from('resumes').remove([row.storage_path]);
  },

  async getDownloadUrl(storagePath) {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(storagePath, 60);
    if (error) throw error;
    return data.signedUrl;
  },
};

export default resumeAdapter;
