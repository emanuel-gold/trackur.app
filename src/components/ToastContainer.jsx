import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AUTO_DISMISS_MS = 4000;

// HeadlessUI's Dialog/Menu modal-mode marks everything inside #root as inert.
// The inert walk stops at <body>, so a body-level sibling of #root is exempt.
function getToastRoot() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  return root;
}

function Toast({ toast, onDismiss, onRemove }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!toast.visible || paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.visible, paused, toast.id, onDismiss]);

  return (
    <Transition
      appear
      show={toast.visible}
      enter="transition ease-out duration-300"
      enterFrom="-translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-200"
      leaveFrom="translate-y-0 opacity-100"
      leaveTo="-translate-y-2 opacity-0"
      afterLeave={() => onRemove(toast.id)}
    >
      <div
        className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-3 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 rounded-lg w-full md:w-auto md:min-w-70"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {toast.type === 'success' ? (
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-500" />
        )}
        <p className="text-sm text-zinc-800 dark:text-zinc-200 flex-1">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </Transition>
  );
}

export default function ToastContainer({ toasts, onDismiss, onRemove }) {
  const [root, setRoot] = useState(null);

  useEffect(() => {
    setRoot(getToastRoot());
  }, []);

  if (!root) return null;

  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 items-center w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} onRemove={onRemove} />
      ))}
    </div>,
    root,
  );
}
