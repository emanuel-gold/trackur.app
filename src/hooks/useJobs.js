import { useState, useEffect, useCallback, useRef } from 'react';
import jobRepository from '../services/jobRepository.js';

export default function useJobs(userId) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const jobs_ref = useRef(jobs);
  jobs_ref.current = jobs;

  useEffect(() => {
    if (!userId) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    jobRepository.getAll().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, [userId]);

  const addJob = useCallback(async (job) => {
    const saved = await jobRepository.save(job);
    setJobs((prev) => [...prev, saved]);
    return saved;
  }, []);

  const updateJob = useCallback(async (id, updates) => {
    const current = jobs_ref.current.find((j) => j.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };
    await jobRepository.save(updated);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
  }, []);

  const deleteJob = useCallback(async (id) => {
    await jobRepository.remove(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const importJobs = useCallback(async (newJobs) => {
    const merged = await jobRepository.saveAll(newJobs);
    setJobs(merged);
    return merged.length;
  }, []);

  const replaceAllJobs = useCallback(async (newJobs) => {
    await jobRepository.replaceAll(newJobs);
    setJobs(newJobs);
  }, []);

  return { jobs, loading, addJob, updateJob, deleteJob, importJobs, replaceAllJobs };
}
