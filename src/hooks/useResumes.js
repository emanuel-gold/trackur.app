import { useState, useEffect, useCallback, useRef } from 'react';
import resumeRepository from '../services/resumeRepository.js';

const MAX_RESUMES = 10;
const MAX_SIZE = 200 * 1024; // 200 KB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Only PDF and DOCX files are allowed');
    }
    if (file.size > MAX_SIZE) {
      throw new Error('File must be under 200 KB');
    }
    // Only Trackur-hosted resumes count toward the 10-resume limit
    const trackurCount = resumesRef.current.filter((r) => r.source !== 'gdrive').length;
    if (trackurCount >= MAX_RESUMES) {
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

  const getDownloadUrl = useCallback(async (resumeOrPath) => {
    return resumeRepository.getDownloadUrl(resumeOrPath);
  }, []);

  const linkDriveFile = useCallback(async (metadata) => {
    const saved = await resumeRepository.linkDriveFile(metadata);
    setResumes((prev) => prev.some((r) => r.id === saved.id) ? prev : [saved, ...prev]);
    return saved;
  }, []);

  return { resumes, loading, uploadResume, renameResume, deleteResume, getDownloadUrl, linkDriveFile };
}
