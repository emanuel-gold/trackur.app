import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon, ArrowRightStartOnRectangleIcon, Cog6ToothIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function UserMenu({ user, profile, onSignOut, onSettings, dark, onToggleDark }) {
  const email = user?.email ?? '';
  const displayName = profile?.firstName || email.split('@')[0];

  return (
    <>
      {/* Desktop: greeting + dropdown */}
      <Menu as="div" className="relative hidden md:block">
        <MenuButton className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 transition-colors">
          <span className="max-w-30 truncate">Hello {displayName}</span>
          <ChevronDownIcon className="size-3.5" />
        </MenuButton>

        <MenuItems
          anchor="bottom end"
          transition
          className="z-50 mt-1.5 w-56 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
        >
          <div className="px-2.5 py-2 border-b border-zinc-950/5 dark:border-white/5 mb-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{email}</p>
          </div>

          <MenuItem>
            <button
              type="button"
              onClick={onSettings}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
            >
              <Cog6ToothIcon className="size-4" />
              Settings
            </button>
          </MenuItem>

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

      {/* Mobile: gear icon with everything inside */}
      <Menu as="div" className="relative md:hidden">
        <MenuButton className="rounded-md p-2 text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 transition-colors">
          <Cog6ToothIcon className="size-6" />
        </MenuButton>

        <MenuItems
          anchor="bottom end"
          transition
          className="z-50 mt-1.5 w-56 origin-top-right rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10"
        >
          <div className="px-2.5 py-2 border-b border-zinc-950/5 dark:border-white/5 mb-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{email}</p>
          </div>

          {/* Dark mode toggle row */}
          <div
            className="flex items-center justify-between rounded-md px-2.5 py-2 cursor-pointer hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors"
            onClick={onToggleDark}
          >
            <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              {dark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
              {dark ? 'Dark mode' : 'Light mode'}
            </span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${dark ? 'bg-violet-600' : 'bg-zinc-300'}`}>
              <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </div>
          </div>

          <MenuItem>
            <button
              type="button"
              onClick={onSettings}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5 transition-colors"
            >
              <Cog6ToothIcon className="size-4" />
              Settings
            </button>
          </MenuItem>

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
    </>
  );
}
