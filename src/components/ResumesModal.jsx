import { Fragment, useState, useCallback, useRef } from 'react';
import { Dialog, DialogBackdrop, Transition, TransitionChild, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ArrowUpTrayIcon, EllipsisVerticalIcon, PencilIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './catalyst';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return Math.round(bytes / 1024) + ' KB';
}

export default function ResumesModal({ open, onClose, resumes = [], onUploadResume, onRenameResume, onDeleteResume, onGetDownloadUrl, gdriveEnabled, gdriveConnected, onConnectGdrive, onPickFromDrive }) {
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

  const handleDownload = useCallback(async (r) => {
    if (!onGetDownloadUrl) return;
    try {
      const ext = r.filename.split('.').pop();
      const filename = r.label ? `${r.label}.${ext}` : r.filename;

      if (r.source === 'gdrive') {
        // GDrive download returns a blob URL directly
        const blobUrl = await onGetDownloadUrl(r);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Trackur (R2) — presigned URL flow
        const url = await onGetDownloadUrl(r);
        const resp = await fetch(url);
        const blob = await resp.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
      }
    } catch {
      // silently fail
    }
  }, [onGetDownloadUrl]);

  const handleDeleteResumeClick = useCallback(async (id) => {
    const resume = resumes.find((r) => r.id === id);
    const isDrive = resume?.source === 'gdrive';
    const message = isDrive
      ? 'Remove this Google Drive resume? Jobs using it will be unlinked. The file will remain in your Drive.'
      : 'Delete this resume? Jobs using it will be unlinked.';
    if (!window.confirm(message)) return;
    try {
      await onDeleteResume(id);
    } catch {
      // silently fail
    }
  }, [onDeleteResume, resumes]);

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
                        <div className="flex flex-col items-start">
                          <h2 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                            Manage Saved Resumes
                          </h2>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {resumes.filter((r) => r.source !== 'gdrive').length} of 10 used
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
                      {resumes.filter((r) => r.source !== 'gdrive').length > 0 && (
                        <div className="space-y-2 mb-4">
                          {resumes.filter((r) => r.source !== 'gdrive').map((r) => (
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
                                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                        {r.filename}
                                      </span>
                                    )}
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {formatFileSize(r.fileSize)}
                                    </span>
                                  </div>
                                </div>

                                <Menu as="div" className="relative shrink-0">
                                  <MenuButton
                                    className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
                                    title="Resume actions"
                                  >
                                    <EllipsisVerticalIcon className="size-5" />
                                  </MenuButton>
                                  <MenuItems
                                    anchor="bottom end"
                                    transition
                                    className="z-50 mt-1.5 w-44 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
                                  >
                                    <MenuItem>
                                      <button
                                        type="button"
                                        onClick={() => { setEditingLabelId(r.id); setEditingLabelValue(r.label || ''); }}
                                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
                                      >
                                        <PencilIcon className="size-4" />
                                        Rename
                                      </button>
                                    </MenuItem>
                                    <MenuItem>
                                      <button
                                        type="button"
                                        onClick={() => handleDownload(r)}
                                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
                                      >
                                        <ArrowDownTrayIcon className="size-4" />
                                        Download
                                      </button>
                                    </MenuItem>
                                    <MenuItem>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteResumeClick(r.id)}
                                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 data-focus:bg-red-50 dark:text-red-400 dark:data-focus:bg-red-950/30 transition-colors"
                                      >
                                        <TrashIcon className="size-4" />
                                        Delete
                                      </button>
                                    </MenuItem>
                                  </MenuItems>
                                </Menu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        outline
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || resumes.filter((r) => r.source !== 'gdrive').length >= 10}
                        className="w-full"
                      >
                        <ArrowUpTrayIcon data-slot="icon" />
                        {uploading ? 'Uploading...' : 'Upload resume'}
                      </Button>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 text-center">
                        PDF or DOCX, max 200 KB
                      </p>
                      {uploadError && (
                        <p className="text-xs text-red-500 mt-1.5 text-center">{uploadError}</p>
                      )}

                      {/* Google Drive section */}
                      {gdriveEnabled && (
                        <div className="mt-6 pt-6 border-t border-zinc-950/5 dark:border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              Google Drive
                            </h3>
                            {gdriveConnected === false && (
                              <Button plain onClick={onConnectGdrive} className="text-xs">
                                Connect
                              </Button>
                            )}
                          </div>

                          {gdriveConnected === false ? (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Connect your Google Drive to link resumes from there.
                            </p>
                          ) : (
                            <>
                              {resumes.filter((r) => r.source === 'gdrive').length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {resumes.filter((r) => r.source === 'gdrive').map((r) => (
                                    <div
                                      key={r.id}
                                      className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 px-3 py-2.5"
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <DocumentTextIcon className="size-4 text-mauve-500 dark:text-mauve-400 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-zinc-950 dark:text-white truncate">
                                            {r.label || r.filename}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            {r.label && (
                                              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                {r.filename}
                                              </span>
                                            )}
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                              Google Drive
                                            </span>
                                          </div>
                                        </div>
                                        <Menu as="div" className="relative shrink-0">
                                          <MenuButton
                                            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
                                            title="Resume actions"
                                          >
                                            <EllipsisVerticalIcon className="size-5" />
                                          </MenuButton>
                                          <MenuItems
                                            anchor="bottom end"
                                            transition
                                            className="z-50 mt-1.5 w-44 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
                                          >
                                            <MenuItem>
                                              <button
                                                type="button"
                                                onClick={() => handleDownload(r)}
                                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
                                              >
                                                <ArrowDownTrayIcon className="size-4" />
                                                Download
                                              </button>
                                            </MenuItem>
                                            <MenuItem>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteResumeClick(r.id)}
                                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 data-focus:bg-red-50 dark:text-red-400 dark:data-focus:bg-red-950/30 transition-colors"
                                              >
                                                <TrashIcon className="size-4" />
                                                Remove
                                              </button>
                                            </MenuItem>
                                          </MenuItems>
                                        </Menu>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <Button outline onClick={onPickFromDrive} className="w-full">
                                Pick from Google Drive
                              </Button>
                            </>
                          )}
                        </div>
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
