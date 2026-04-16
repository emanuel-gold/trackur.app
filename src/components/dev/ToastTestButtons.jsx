/**
 * DEV-ONLY toast test buttons.
 *
 * To enable in the User Menu:
 *  1. In src/App.jsx, find the <Layout …> render and add:  showToast={showToast}
 *  2. In src/components/Layout.jsx, accept `showToast` in props and forward it
 *     to <UserMenu …> as showToast={showToast}.
 *  3. In src/components/UserMenu.jsx:
 *       - accept `showToast` in props
 *       - import this component:
 *             import ToastTestButtons from './dev/ToastTestButtons.jsx';
 *       - drop <ToastTestButtons showToast={showToast} /> inside each <MenuItems>
 *         block (desktop + mobile) where you want the buttons to appear.
 *
 * To remove: delete the import + the <ToastTestButtons /> usages in UserMenu.jsx.
 * The prop plumbing in App/Layout/UserMenu can stay — it's harmless if unused.
 */

import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ToastTestButtons({ showToast }) {
  return (
    <div className="flex items-center justify-center gap-4 px-2.5 py-2">
      <button
        type="button"
        onClick={() => showToast('Test success toast', 'success')}
        className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
        aria-label="Trigger test success toast"
      >
        <CheckCircleIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => showToast('Test error toast', 'error')}
        className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
        aria-label="Trigger test error toast"
      >
        <ExclamationCircleIcon className="size-5" />
      </button>
    </div>
  );
}
