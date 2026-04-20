import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { STAGES, STAGE_COLORS, CHAR_LIMITS } from '../constants.js';
import { Badge, Button } from './catalyst';
import useInlineEdit from '../hooks/useInlineEdit.js';
import useTodos from '../hooks/useTodos.js';
import InlineEditableField from './InlineEditableField.jsx';
import TodoList from './TodoList.jsx';
import SlideOutPanel from './SlideOutPanel.jsx';
import ResumePickerSection from './ResumePickerSection.jsx';
import { formatDate } from '../utils/formatDate.js';

const FIELD_CONFIG = [
  { key: 'role', label: 'Role', required: true, placeholder: 'Job title', maxLength: CHAR_LIMITS.role },
  { key: 'company', label: 'Company', required: true, placeholder: 'Company name', maxLength: CHAR_LIMITS.company },
  { key: 'stage', label: 'Stage', inputType: 'select', selectOptions: STAGES },
  { key: 'dateApplied', label: 'Date Applied', inputType: 'date', placeholder: 'Set date' },
  { key: 'notes', label: 'Notes', inputType: 'textarea', placeholder: 'Add notes...', maxLength: CHAR_LIMITS.notes },
];

export default function EditJobModal({ job, onUpdate, onDelete, onClose, resumes = [], onGetDownloadUrl, onUploadResume, onManageResumes, gdriveEnabled, gdriveConnected, onConnectGdrive, onPickFromDrive }) {
  const { editingField, draftValue, startEdit, updateDraft, cancel, save } = useInlineEdit();
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = useTodos(job, onUpdate);
  const [fieldError, setFieldError] = useState(null);

  useEffect(() => {
    if (!fieldError) return;
    const t = setTimeout(() => setFieldError(null), 5000);
    return () => clearTimeout(t);
  }, [fieldError]);

  if (!job) return null;

  const handleSave = () => {
    const { field, value } = save();
    if (!field) return;
    if ((field === 'company' || field === 'role') && !value.trim()) return;
    if (value && FIELD_CONFIG.find((c) => c.key === field)?.inputType === 'date') {
      const year = parseInt(value.split('-')[0], 10);
      if (year < 2000 || year > 2099) {
        setFieldError({ field, message: 'Sorry, time traveller! Year must be between 2000 and 2099.' });
        return;
      }
    }
    onUpdate(job.id, { [field]: value });
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleDelete = () => {
    onDelete(job.id);
    onClose();
  };

  const renderField = (config) => {
    const { key, label, inputType, selectOptions, placeholder, required, maxLength } = config;
    const isStage = key === 'stage';

    const isDate = inputType === 'date';
    const displayRender = isStage
      ? (val) => <Badge color={STAGE_COLORS[val]?.badge || 'zinc'}>{val || 'Not set'}</Badge>
      : isDate
        ? (val) => val ? formatDate(val) : undefined
        : undefined;

    return (
      <div key={key} className={key === 'notes' ? 'col-span-full' : ''}>
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
          {label}
        </div>
        <InlineEditableField
          value={job[key]}
          fieldName={key}
          isEditing={editingField === key}
          draftValue={draftValue}
          onStartEdit={(fieldName, val) => { setFieldError(null); startEdit(fieldName, val); }}
          onDraftChange={updateDraft}
          onSave={handleSave}
          onCancel={cancel}
          onBlur={handleBlur}
          inputType={inputType}
          selectOptions={selectOptions}
          placeholder={placeholder || 'Not set'}
          required={required}
          maxLength={maxLength}
          displayRender={displayRender}
          className="text-sm text-zinc-950 dark:text-white"
        />
        {fieldError?.field === key && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldError.message}</p>
        )}
      </div>
    );
  };

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-base/7 font-semibold text-zinc-950 dark:text-white truncate">
          {job.role}
        </h2>
        <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 truncate">
          {job.company}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge color={STAGE_COLORS[job.stage]?.badge || 'zinc'}>{job.stage}</Badge>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
    </div>
  );

  const body = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
      {FIELD_CONFIG.filter((c) => c.key !== 'notes').map(renderField)}

      <div className="col-span-full">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
          Next Steps
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 px-3 py-2">
          <TodoList
            todos={todos}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onRemove={removeTodo}
            onUpdate={updateTodo}
          />
        </div>
      </div>

      <div className="col-span-full">
        <ResumePickerSection
          value={job.resumeId}
          onChange={(v) => onUpdate(job.id, { resumeId: v })}
          resumes={resumes}
          onUploadResume={onUploadResume}
          gdriveEnabled={gdriveEnabled}
          gdriveConnected={gdriveConnected}
          onConnectGdrive={onConnectGdrive}
          onPickFromDrive={onPickFromDrive}
          onGetDownloadUrl={onGetDownloadUrl}
          onManageResumes={onManageResumes}
          removeLabel="Remove From Job"
        />
      </div>

      {FIELD_CONFIG.filter((c) => c.key === 'notes').map(renderField)}
    </div>
  );

  const footer = (
    <Button color="red" className="w-full hover:bg-red-700" onClick={handleDelete}>
      Delete Job
    </Button>
  );

  return (
    <SlideOutPanel open onClose={onClose} header={header} body={body} footer={footer} />
  );
}
