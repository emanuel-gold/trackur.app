import { useState, useEffect, useCallback, useRef } from 'react';
import resumeRepository from '../services/resumeRepository.js';

const MAX_RESUMES = 10;
const MAX_SIZE = 200 * 1024; // 200 KB

export default function useResumes(userId) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const resumesRef = useRef(resumes);
  resumesRef.current = resumes;

  useEffect(() => {
    if (!userId) {
      setResumes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    resumeRepository.getAll().then((data) => {
      setResumes(data);
    }).catch(() => {
      // Table may not exist yet — continue with empty list
    }).finally(() => {
      setLoading(false);
    });
  }, [userId]);

  const uploadResume = useCallback(async (file, label) => {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (file.size > MAX_SIZE) {
      throw new Error('File must be under 200 KB');
    }
    if (resumesRef.current.length >= MAX_RESUMES) {
      throw new Error('Resume library is full (max 10)');
    }
    const saved = await resumeRepository.insert(
      { filename: file.name, label, fileSize: file.size },
      file,
    );
    setResumes((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const renameResume = useCallback(async (id, label) => {
    const updated = await resumeRepository.updateLabel(id, label);
    setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteResume = useCallback(async (id) => {
    await resumeRepository.remove(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getDownloadUrl = useCallback(async (storagePath) => {
    return resumeRepository.getDownloadUrl(storagePath);
  }, []);

  return { resumes, loading, uploadResume, renameResume, deleteResume, getDownloadUrl };
}
