import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Switch } from './catalyst';
import UserMenu from './UserMenu.jsx';
import TrackurWordmark from './TrackurWordmark.jsx';

export default function Layout({ dark, onToggleDark, user, profile, onSignOut, onSettings, children }) {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-200 dark:bg-zinc-950">
      {/* Header — full-width, separate from content */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <TrackurWordmark size="sm" />
        </div>
        <div className="flex items-center gap-3">
          {user && <UserMenu user={user} profile={profile} onSignOut={onSignOut} onSettings={onSettings} />}
          <div className="flex items-center gap-2">
            <SunIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
            <Switch color="violet" checked={dark} onChange={onToggleDark} />
            <MoonIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
          </div>
        </div>
      </header>

      {/* Tray — single white panel floating above the background */}
      <main className="flex flex-1 flex-col px-2 pb-2 md:px-4 md:pb-4">
        <div className="flex flex-1 flex-col rounded-xl bg-white p-3 pb-20 shadow-sm ring-1 ring-zinc-950/5 md:p-4 md:pb-4 lg:p-6 lg:pb-6 dark:bg-zinc-800 dark:ring-white/10">
          {children}
        </div>
      </main>
    </div>
  );
}
