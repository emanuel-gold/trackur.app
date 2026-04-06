import { Fragment, useState, useRef, useCallback } from 'react';
import { Dialog, DialogBackdrop, Transition, TransitionChild, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, EllipsisVerticalIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { STAGES, STAGE_COLORS } from '../constants.js';
import { Badge, Button, Select } from './catalyst';
import useInlineEdit from '../hooks/useInlineEdit.js';
import useTodos from '../hooks/useTodos.js';
import InlineEditableField from './InlineEditableField.jsx';
import TodoList from './TodoList.jsx';
import { formatDate } from '../utils/formatDate.js';

const FIELD_CONFIG = [
  { key: 'company', label: 'Company', required: true, placeholder: 'Company name' },
  { key: 'role', label: 'Role', required: true, placeholder: 'Job title' },
  { key: 'stage', label: 'Stage', inputType: 'select', selectOptions: STAGES },
  { key: 'dateApplied', label: 'Date Applied', inputType: 'date', placeholder: 'Set date' },
  { key: 'notes', label: 'Notes', inputType: 'textarea', placeholder: 'Add notes...' },
];

export default function EditJobModal({ job, onUpdate, onDelete, onClose, resumes = [], onGetDownloadUrl, onUploadResume, onManageResumes }) {
  const { editingField, draftValue, startEdit, updateDraft, cancel, save } = useInlineEdit();
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = useTodos(job, onUpdate);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  if (!job) return null;

  const handleSave = () => {
    const { field, value } = save();
    if (!field) return;
    if ((field === 'company' || field === 'role') && !value.trim()) return;
    onUpdate(job.id, { [field]: value });
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleDelete = () => {
    onDelete(job.id);
    onClose();
  };

  const handleViewResume = useCallback(async () => {
    const resume = resumes.find((r) => r.id === job.resumeId);
    if (!resume || !onGetDownloadUrl) return;
    try {
      const url = await onGetDownloadUrl(resume.storagePath);
      window.open(url, '_blank');
    } catch {
      // silently fail
    }
  }, [resumes, job.resumeId, onGetDownloadUrl]);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const saved = await onUploadResume(file, '');
      onUpdate(job.id, { resumeId: saved.id });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [onUploadResume, onUpdate, job.id]);

  const renderField = (config) => {
    const { key, label, inputType, selectOptions, placeholder, required } = config;
    const isStage = key === 'stage';

    const isDate = inputType === 'date';
    const displayRender = isStage
      ? (val) => <Badge color={STAGE_COLORS[val]?.badge || 'zinc'}>{val || 'Not set'}</Badge>
      : isDate
        ? (val) => val ? formatDate(val) : undefined
        : undefined;

    return (
      <div key={key} className={key === 'notes' ? 'col-span-full' : ''}>
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
          {label}
        </div>
        <InlineEditableField
          value={job[key]}
          fieldName={key}
          isEditing={editingField === key}
          draftValue={draftValue}
          onStartEdit={startEdit}
          onDraftChange={updateDraft}
          onSave={handleSave}
          onCancel={cancel}
          onBlur={handleBlur}
          inputType={inputType}
          selectOptions={selectOptions}
          placeholder={placeholder || 'Not set'}
          required={required}
          displayRender={displayRender}
          className="text-sm text-zinc-950 dark:text-white"
        />
      </div>
    );
  };

  return (
    <Transition show appear as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/50" />
        </TransitionChild>

        {/* Panel */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="fixed inset-0 overflow-hidden" onClick={onClose}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full md:pl-16">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="pointer-events-auto w-screen max-w-full md:max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/10 dark:ring-white/10">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-950/5 dark:border-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-base/7 font-semibold text-zinc-950 dark:text-white truncate">
                            {job.company}
                          </h2>
                          <p className="text-sm/6 text-zinc-500 dark:text-zinc-400 truncate">
                            {job.role}
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
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                        {FIELD_CONFIG.filter((c) => c.key !== 'notes').map(renderField)}

                        {/* Next Steps (todo list) */}
                        <div className="col-span-full">
                          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
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

                        {/* Resume */}
                        <div className="col-span-full">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              Resume
                            </div>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">{resumes.length} of 10</span>
                          </div>
                          {resumes.length === 0 ? (
                            <Button outline onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                              <ArrowUpTrayIcon data-slot="icon" />
                              {uploading ? 'Uploading...' : 'Upload resume'}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                value={job.resumeId || ''}
                                onChange={(e) => onUpdate(job.id, { resumeId: e.target.value || null })}
                                className="flex-1"
                              >
                                <option value="">None</option>
                                {resumes.map((r) => (
                                  <option key={r.id} value={r.id}>{r.label || r.filename}</option>
                                ))}
                              </Select>
                              <Menu as="div" className="relative">
                                <MenuButton
                                  className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
                                  title="Resume actions"
                                >
                                  <EllipsisVerticalIcon className="size-5" />
                                </MenuButton>
                                <MenuItems
                                  anchor="bottom end"
                                  transition
                                  className="z-50 mt-1.5 w-52 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
                                >
                                  {job.resumeId && (
                                    <MenuItem>
                                      <button type="button" onClick={handleViewResume} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors">
                                        <ArrowDownTrayIcon className="size-4" />
                                        Download Resume
                                      </button>
                                    </MenuItem>
                                  )}
                                  {resumes.length < 10 && (
                                    <MenuItem disabled={uploading}>
                                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors disabled:opacity-50">
                                        <ArrowUpTrayIcon className="size-4" />
                                        Upload New Resume
                                      </button>
                                    </MenuItem>
                                  )}
                                  <MenuItem>
                                    <button type="button" onClick={onManageResumes} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors">
                                      <DocumentTextIcon className="size-4" />
                                      Manage Resumes
                                    </button>
                                  </MenuItem>
                                </MenuItems>
                              </Menu>
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

                        {FIELD_CONFIG.filter((c) => c.key === 'notes').map(renderField)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-950/5 dark:border-white/5 px-5 py-4">
                      <Button color="red" className="w-full hover:bg-red-700" onClick={handleDelete}>
                        Delete Job
                      </Button>
                    </div>
                  </div>
                </div>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
