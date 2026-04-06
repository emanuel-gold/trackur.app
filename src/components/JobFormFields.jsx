import { useState, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { STAGES } from '../constants.js';
import { Field, FieldGroup, Label, Input, Select, Textarea, Button } from './catalyst';

export default function JobFormFields({ values, onChange, resumes = [], onUploadResume }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const field = (name) => ({
    value: values[name] || '',
    onChange: (e) => onChange(name, e.target.value),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const saved = await onUploadResume(file, '');
      onChange('resumeId', saved.id);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <FieldGroup className="space-y-4">
      <Field>
        <Label>Company Name *</Label>
        <Input type="text" required placeholder="e.g. HubSpot" {...field('company')} />
      </Field>

      <Field>
        <Label>Role *</Label>
        <Input type="text" required placeholder="e.g. Frontend Developer" {...field('role')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>Date Applied</Label>
          <Input type="date" {...field('dateApplied')} />
        </Field>

        <Field>
          <Label>Stage</Label>
          <Select {...field('stage')}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Resume — always shown */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm/6 font-medium text-zinc-950 dark:text-white select-none">Resume</label>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{resumes.length} of 10</span>
        </div>
        {resumes.length === 0 ? (
          <Button outline onClick={() => fileInputRef.current?.click()} disabled={uploading || !onUploadResume} className="w-full">
            <ArrowUpTrayIcon data-slot="icon" />
            {uploading ? 'Uploading...' : 'Upload resume'}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Select value={values.resumeId || ''} onChange={(e) => onChange('resumeId', e.target.value || null)} className="flex-1">
              <option value="">None</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.label || r.filename}</option>
              ))}
            </Select>
            {resumes.length < 10 && onUploadResume && (
              <Button plain onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload new resume">
                <ArrowUpTrayIcon data-slot="icon" />
              </Button>
            )}
          </div>
        )}
        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>First Step</Label>
          <Input type="text" placeholder="e.g. Follow up with recruiter" {...field('firstStep')} />
        </Field>

        <Field>
          <Label>Due Date</Label>
          <Input type="date" {...field('firstStepDate')} />
        </Field>
      </div>

      <Field>
        <Label>Notes</Label>
        <Textarea rows={3} resizable={false} placeholder="Add notes, to-do items, or anything else." {...field('notes')} />
      </Field>
    </FieldGroup>
  );
}
