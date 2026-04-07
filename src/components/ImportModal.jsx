import { useState, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogTitle, DialogBody, DialogActions } from './catalyst';
import { parseCsvFile } from '../services/csvService.js';

export default function ImportModal({ open, onClose, onImport, onReplace }) {
  const [parsedJobs, setParsedJobs] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    try {
      const jobs = await parseCsvFile(file);
      setParsedJobs(jobs);
    } catch {
      setError('Failed to parse CSV file. Please check the format.');
      setParsedJobs(null);
    }
  };

  const handleClose = () => {
    setParsedJobs(null);
    setError(null);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      <DialogTitle>Import Jobs from CSV</DialogTitle>
      <DialogBody>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-950/10 dark:border-white/10 rounded-lg cursor-pointer hover:border-mauve-400 hover:bg-mauve-50/50 dark:hover:bg-mauve-950/50 transition-colors">
          <ArrowUpTrayIcon className="size-8 text-zinc-500 dark:text-zinc-400 mb-2" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {fileName || 'Click to select a CSV file'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {parsedJobs && (
          <div className="mt-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Found <span className="font-semibold">{parsedJobs.length}</span> job{parsedJobs.length !== 1 ? 's' : ''} in the file.
            </p>
            <div className="mt-4 flex gap-2">
              <Button color="violet" className="flex-1" onClick={() => { onImport(parsedJobs); handleClose(); }}>
                Merge with existing
              </Button>
              <Button outline className="flex-1" onClick={() => { onReplace(parsedJobs); handleClose(); }}>
                Replace all
              </Button>
            </div>
          </div>
        )}
      </DialogBody>
      <DialogActions>
        <Button plain onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
