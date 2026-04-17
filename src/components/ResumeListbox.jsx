import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import clsx from 'clsx';
import ResumeSourceIcon from './ResumeSourceIcon.jsx';

const chevron = (
  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg
      className="size-5 stroke-zinc-500 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
    >
      <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export default function ResumeListbox({ value, onChange, resumes = [], disabled, className }) {
  const selected = resumes.find((r) => r.id === value) || null;
  const trackurResumes = resumes.filter((r) => r.source !== 'gdrive');
  const driveResumes = resumes.filter((r) => r.source === 'gdrive');
  const hasGroups = trackurResumes.length > 0 && driveResumes.length > 0;

  return (
    <Listbox value={value || ''} onChange={(v) => onChange(v || null)} disabled={disabled}>
      <span
        data-slot="control"
        className={clsx(
          className,
          'group relative block w-full min-w-0',
          'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
          'dark:before:hidden',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-focus:after:ring-2 has-data-focus:after:ring-mauve-500',
          'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none',
        )}
      >
        <ListboxButton
          className={clsx(
            'relative flex w-full items-center gap-2 appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
            'pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
            'text-left text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
            'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
            'bg-transparent dark:bg-white/5',
            'focus:outline-hidden',
            'data-disabled:border-zinc-950/20 data-disabled:opacity-100 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5',
          )}
        >
          {selected ? (
            <>
              <ResumeSourceIcon source={selected.source} className="size-4 shrink-0" />
              <span className="truncate">{selected.label || selected.filename}</span>
            </>
          ) : (
            <span className="truncate text-zinc-500 dark:text-zinc-400">None</span>
          )}
          {chevron}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          transition
          className="z-50 mt-1.5 w-(--button-width) origin-top max-h-60 overflow-auto rounded-lg bg-white p-1 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-800 dark:ring-white/10 focus:outline-hidden"
        >
          <ListboxOption
            value=""
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-500 data-focus:bg-zinc-950/5 dark:text-zinc-400 dark:data-focus:bg-white/5"
          >
            None
          </ListboxOption>

          {hasGroups && trackurResumes.length > 0 && (
            <div className="mt-1 px-2.5 pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Trackur Resumes
            </div>
          )}
          {trackurResumes.map((r) => (
            <ListboxOption
              key={r.id}
              value={r.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5"
            >
              <ResumeSourceIcon source="trackur" className="size-4 shrink-0" />
              <span className="truncate">{r.label || r.filename}</span>
            </ListboxOption>
          ))}

          {hasGroups && driveResumes.length > 0 && (
            <div className="mt-1 px-2.5 pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Google Drive
            </div>
          )}
          {driveResumes.map((r) => (
            <ListboxOption
              key={r.id}
              value={r.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 data-focus:bg-zinc-950/5 dark:text-zinc-300 dark:data-focus:bg-white/5"
            >
              <ResumeSourceIcon source="gdrive" className="size-4 shrink-0" />
              <span className="truncate">{r.label || r.filename}</span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </span>
    </Listbox>
  );
}
