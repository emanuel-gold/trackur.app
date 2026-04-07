import { useState, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { STAGES } from '../constants.js';
import { Field, FieldGroup, Label, Input, Select, Textarea, Button } from './catalyst';
import { CHAR_LIMITS } from '../constants.js';

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
        <Input type="text" required maxLength={CHAR_LIMITS.company} placeholder="e.g. HubSpot" {...field('company')} />
        {(values.company || '').length >= CHAR_LIMITS.company && (
          <span className="text-xs text-red-500 dark:text-red-400">Max {CHAR_LIMITS.company} characters.</span>
        )}
      </Field>

      <Field>
        <Label>Role *</Label>
        <Input type="text" required maxLength={CHAR_LIMITS.role} placeholder="e.g. Frontend Developer" {...field('role')} />
        {(values.role || '').length >= CHAR_LIMITS.role && (
          <span className="text-xs text-red-500 dark:text-red-400">Max {CHAR_LIMITS.role} characters.</span>
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>Date Applied</Label>
          <Input type="date" min="2000-01-01" max="2099-12-31" {...field('dateApplied')} />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>Next Step</Label>
          <Input type="text" placeholder="e.g. Follow up with recruiter" {...field('firstStep')} />
        </Field>

        <Field>
          <Label>Due Date</Label>
          <Input type="date" min="2000-01-01" max="2099-12-31" {...field('firstStepDate')} />
        </Field>
      </div>

      {/* Resume — always shown */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm/6 font-medium text-zinc-950 dark:text-white select-none">Attach Resume</label>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{resumes.length} of 10</span>
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

      <Field>
        <Label>Notes</Label>
        <Textarea rows={3} resizable={false} maxLength={CHAR_LIMITS.notes} placeholder="Add a link to the job description, questions to ask, or anything else." {...field('notes')} />
        {(() => {
          const len = (values.notes || '').length;
          const remaining = CHAR_LIMITS.notes - len;
          const color = remaining <= 15
            ? 'text-red-500 dark:text-red-400'
            : len >= CHAR_LIMITS.notes * 0.75
              ? 'text-yellow-500 dark:text-yellow-400'
              : 'text-zinc-500 dark:text-zinc-400';
          return <span className={`text-xs ${color}`}>{len}/{CHAR_LIMITS.notes}</span>;
        })()}
      </Field>
    </FieldGroup>
  );
}
