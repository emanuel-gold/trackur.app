import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogTitle, DialogBody, DialogActions } from './catalyst';
import JobFormFields from './JobFormFields.jsx';

const EMPTY = {
  company: '',
  role: '',
  dateApplied: '',
  stage: 'Applied',
  firstStep: '',
  firstStepDate: '',
  notes: '',
};

export default function AddJobForm({ onAdd, open, onClose }) {
  const [values, setValues] = useState({ ...EMPTY });

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstStep, firstStepDate, ...jobData } = values;
    const todos = [];
    if (firstStep.trim()) {
      todos.push({
        id: crypto.randomUUID(),
        text: firstStep.trim(),
        dueDate: firstStepDate || null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      });
    }
    onAdd({ ...jobData, todos });
    setValues({ ...EMPTY });
    onClose();
  };

  const closeFab = (
    <button
      type="button"
      onClick={onClose}
      className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center size-14 rounded-full bg-zinc-600 text-white shadow-lg hover:bg-zinc-700 transition-colors"
    >
      <XMarkIcon className="size-7" />
    </button>
  );

  return (
    <Dialog open={open} onClose={onClose} size="lg" fixedContent={closeFab}>
      <DialogTitle>Add New Job</DialogTitle>
      <DialogBody>
        <form onSubmit={handleSubmit}>
          <JobFormFields values={values} onChange={handleChange} />
          <DialogActions>
            <Button plain onClick={onClose}>Cancel</Button>
            <Button color="violet" type="submit">Add Job</Button>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
}
