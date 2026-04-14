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
    source: row.source ?? 'trackur',
    externalId: row.external_id ?? null,
    externalMimeType: row.external_mime_type ?? null,
    externalIconUrl: row.external_icon_url ?? null,
  };
}

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.access_token;
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
    const token = await getAccessToken();

    // Upload file to R2 via API
    const uploadRes = await fetch('/api/resume/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
      },
      body: file,
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    const { storagePath } = await uploadRes.json();

    // Insert DB row (RLS enforces auth.uid() = user_id)
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
      // Clean up orphaned file in R2
      await fetch('/api/resume/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storagePath }),
      }).catch(() => {});
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
    // Get storage path and source before deleting the row
    const { data: row, error: fetchError } = await supabase
      .from('resumes')
      .select('storage_path, source')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    // Delete DB row (triggers ON DELETE SET NULL on jobs)
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;

    // Remove file from R2 (best-effort) — only for Trackur-hosted resumes
    if (row.storage_path && (!row.source || row.source === 'trackur')) {
      const token = await getAccessToken();
      await fetch('/api/resume/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storagePath: row.storage_path }),
      }).catch(() => {});
    }
  },

  async getDownloadUrl(resumeOrPath) {
    const token = await getAccessToken();

    // Support both legacy string path and full resume object
    const isResume = typeof resumeOrPath === 'object' && resumeOrPath !== null;
    const source = isResume ? (resumeOrPath.source ?? 'trackur') : 'trackur';

    if (source === 'gdrive') {
      // Proxy download through our API — returns the file blob directly
      const res = await fetch('/api/gdrive/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId: resumeOrPath.externalId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error === 'gdrive_disconnected') {
          throw new GDriveDisconnectedError();
        }
        throw new Error(err.error || 'Failed to download from Google Drive');
      }
      // Return a blob URL for the downloaded file
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }

    // Trackur (R2) resume — existing presigned URL flow
    const storagePath = isResume ? resumeOrPath.storagePath : resumeOrPath;
    const res = await fetch('/api/resume/download-url', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storagePath }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get download URL');
    }
    const { url } = await res.json();
    return url;
  },

  async linkDriveFile(metadata) {
    // Insert a resumes row for a Google Drive file (no file upload needed)
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        filename: metadata.filename,
        label: metadata.label || null,
        storage_path: null,
        file_size: metadata.fileSize || null,
        source: 'gdrive',
        external_id: metadata.externalId,
        external_mime_type: metadata.externalMimeType || null,
        external_icon_url: metadata.externalIconUrl || null,
      })
      .select()
      .single();
    if (error) throw error;
    return toApp(data);
  },
};

export class GDriveDisconnectedError extends Error {
  constructor() {
    super('Google Drive is not connected');
    this.name = 'GDriveDisconnectedError';
  }
}

export default resumeAdapter;
