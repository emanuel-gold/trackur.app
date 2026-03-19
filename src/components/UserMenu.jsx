import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function UserMenu({ user, profile, onSignOut }) {
  const email = user?.email ?? '';
  const displayName = profile?.firstName || email.split('@')[0];

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 transition-colors">
        <span className="max-w-30 truncate">Hello {displayName}</span>
        <ChevronDownIcon className="size-3.5" />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-1.5 w-56 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
      >
        {/* Email display */}
        <div className="px-2.5 py-2 border-b border-zinc-950/5 dark:border-white/5 mb-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{email}</p>
        </div>

        <MenuItem>
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="size-4" />
            Sign out
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
