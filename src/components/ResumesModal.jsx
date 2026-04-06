import { Fragment, useState, useCallback, useRef } from 'react';
import { Dialog, DialogBackdrop, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Button } from './catalyst';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return Math.round(bytes / 1024) + ' KB';
}

export default function ResumesModal({ open, onClose, resumes = [], onUploadResume, onRenameResume, onDeleteResume }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelValue, setEditingLabelValue] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      await onUploadResume(file, '');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [onUploadResume]);

  const handleRenameSubmit = useCallback(async () => {
    if (!editingLabelId) return;
    try {
      await onRenameResume(editingLabelId, editingLabelValue.trim());
    } catch {
      // silently fail — label resets on next load
    }
    setEditingLabelId(null);
    setEditingLabelValue('');
  }, [editingLabelId, editingLabelValue, onRenameResume]);

  const handleDeleteResumeClick = useCallback(async (id) => {
    if (!window.confirm('Delete this resume? Jobs using it will be unlinked.')) return;
    try {
      await onDeleteResume(id);
    } catch {
      // silently fail
    }
  }, [onDeleteResume]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
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

        <div className="fixed inset-0 overflow-hidden">
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
                <div className="pointer-events-auto w-screen max-w-full md:max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/10 dark:ring-white/10">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-950/5 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h2 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                            Resumes
                          </h2>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {resumes.length} of 10 used
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-sm p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                      {resumes.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {resumes.map((r) => (
                            <div
                              key={r.id}
                              className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 px-3 py-2.5"
                            >
                              <div className="flex items-start gap-2.5">
                                <DocumentTextIcon className="size-4 text-mauve-500 dark:text-mauve-400 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  {editingLabelId === r.id ? (
                                    <input
                                      type="text"
                                      value={editingLabelValue}
                                      onChange={(e) => setEditingLabelValue(e.target.value)}
                                      onBlur={handleRenameSubmit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSubmit();
                                        if (e.key === 'Escape') { setEditingLabelId(null); setEditingLabelValue(''); }
                                      }}
                                      autoFocus
                                      placeholder="Add a label..."
                                      className="w-full text-sm font-medium bg-transparent border-b border-mauve-400 dark:border-mauve-500 outline-none text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pb-0.5"
                                    />
                                  ) : (
                                    <p className="text-sm font-medium text-zinc-950 dark:text-white truncate">
                                      {r.label || r.filename}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {r.label && (
                                      <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                                        {r.filename}
                                      </span>
                                    )}
                                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                      {formatFileSize(r.fileSize)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingLabelId(r.id); setEditingLabelValue(r.label || ''); }}
                                    className="rounded p-1 text-zinc-400 hover:text-mauve-600 hover:bg-mauve-50 dark:hover:text-mauve-400 dark:hover:bg-mauve-950/50 transition-colors"
                                    title="Rename"
                                  >
                                    <PencilIcon className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteResumeClick(r.id)}
                                    className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                                    title="Delete"
                                  >
                                    <TrashIcon className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        outline
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || resumes.length >= 10}
                        className="w-full"
                      >
                        <ArrowUpTrayIcon data-slot="icon" />
                        {uploading ? 'Uploading...' : 'Upload resume'}
                      </Button>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 text-center">
                        PDF only, max 200 KB
                      </p>
                      {uploadError && (
                        <p className="text-xs text-red-500 mt-1.5 text-center">{uploadError}</p>
                      )}
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
