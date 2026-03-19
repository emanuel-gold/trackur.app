import { useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { INDUSTRIES } from '../constants/industries.js';
import { Input } from './catalyst';

const OTHER_SENTINEL = '__other__';

export default function IndustryMultiSelect({ value = [], onChange }) {
  const [otherValue, setOtherValue] = useState('');
  const [showOther, setShowOther] = useState(false);

  // Separate predefined selections from custom entries
  const predefinedSelected = value.filter((v) => INDUSTRIES.includes(v));
  const customEntries = value.filter((v) => !INDUSTRIES.includes(v));

  // "Other" is active if toggled on OR if there are already custom entries
  const otherActive = showOther || customEntries.length > 0;

  // Build internal value list (predefined + sentinel if other is active)
  const internalValue = [...predefinedSelected, ...(otherActive ? [OTHER_SENTINEL] : [])];

  const handleChange = (newSelection) => {
    const hadOther = internalValue.includes(OTHER_SENTINEL);
    const hasOther = newSelection.includes(OTHER_SENTINEL);

    // Filter out the sentinel to get real predefined selections
    const predefined = newSelection.filter((v) => v !== OTHER_SENTINEL);

    if (!hadOther && hasOther) {
      // Other was just selected
      setShowOther(true);
      onChange([...predefined, ...customEntries]);
    } else if (hadOther && !hasOther) {
      // Other was deselected — remove custom entries
      setShowOther(false);
      onChange(predefined);
    } else {
      // Normal industry toggle
      onChange([...predefined, ...customEntries]);
    }
  };

  const addCustomEntry = () => {
    const trimmed = otherValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setOtherValue('');
    }
  };

  const removeCustomEntry = (entry) => {
    onChange(value.filter((v) => v !== entry));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomEntry();
    }
  };

  const selectedCount = predefinedSelected.length + customEntries.length;

  return (
    <div className="space-y-2">
      <Listbox value={internalValue} onChange={handleChange} multiple>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'group relative block w-full',
              // Pseudo-element background (light mode)
              'before:absolute before:inset-px before:rounded-[calc(0.5rem-1px)] before:bg-white before:shadow-sm',
              'dark:before:hidden',
              'focus:outline-hidden',
              // Focus ring — mauve to match project theme
              'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset data-focus:after:ring-2 data-focus:after:ring-mauve-500',
            )}
          >
            <span
              className={clsx(
                'relative flex w-full items-center justify-between rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                'min-h-11 sm:min-h-9',
                'pr-[calc(--spacing(7)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
                'text-left text-base/6 sm:text-sm/6',
                'border border-zinc-950/10 group-data-active:border-zinc-950/20 group-data-hover:border-zinc-950/20',
                'dark:border-white/10 dark:group-data-active:border-white/20 dark:group-data-hover:border-white/20',
                'bg-transparent dark:bg-white/5',
              )}
            >
              <span className={clsx(
                'block truncate',
                selectedCount > 0 ? 'text-zinc-950 dark:text-white' : 'text-zinc-500',
              )}>
                {selectedCount === 0
                  ? 'Select industries...'
                  : `${selectedCount} selected`}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="size-5 stroke-zinc-500 sm:size-4 dark:stroke-zinc-400" />
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            anchor="bottom start"
            className={clsx(
              '[--anchor-gap:--spacing(1)] [--anchor-padding:--spacing(4)]',
              'isolate w-(--button-width) scroll-py-1 rounded-xl p-1 select-none',
              'outline outline-transparent focus:outline-hidden',
              'overflow-y-auto overscroll-contain max-h-60',
              'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
              'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
              'transition-opacity duration-100 ease-in data-closed:data-leave:opacity-0 data-transition:pointer-events-none',
            )}
          >
            {INDUSTRIES.map((industry) => (
              <ListboxOption
                key={industry}
                value={industry}
                className={clsx(
                  'group/option flex cursor-default items-center gap-2 rounded-lg py-2.5 pr-3.5 pl-2 sm:py-1.5 sm:pr-3 sm:pl-1.5',
                  'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
                  'outline-hidden data-focus:bg-mauve-500 data-focus:text-white',
                  'select-none',
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600 group-data-selected/option:border-mauve-500 group-data-selected/option:bg-mauve-500 group-data-focus/option:border-white/30 sm:size-4">
                  <CheckIcon className="hidden size-3.5 text-white group-data-selected/option:block sm:size-3 stroke-2" />
                </span>
                <span className="truncate">{industry}</span>
              </ListboxOption>
            ))}

            {/* Other option */}
            <ListboxOption
              value={OTHER_SENTINEL}
              className={clsx(
                'group/option flex cursor-default items-center gap-2 rounded-lg py-2.5 pr-3.5 pl-2 sm:py-1.5 sm:pr-3 sm:pl-1.5',
                'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
                'outline-hidden data-focus:bg-mauve-500 data-focus:text-white',
                'select-none',
                'border-t border-zinc-950/5 dark:border-white/5 mt-1 pt-2',
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600 group-data-selected/option:border-mauve-500 group-data-selected/option:bg-mauve-500 group-data-focus/option:border-white/30 sm:size-4">
                <CheckIcon className="hidden size-3.5 text-white group-data-selected/option:block sm:size-3 stroke-2" />
              </span>
              <span className="truncate">Other</span>
            </ListboxOption>
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Selected tags */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {predefinedSelected.map((industry) => (
            <span
              key={industry}
              className="inline-flex items-center gap-1 rounded-full bg-mauve-100 px-2.5 py-1 text-xs font-medium text-mauve-700 ring-1 ring-inset ring-mauve-300 dark:bg-mauve-900/30 dark:text-mauve-300 dark:ring-mauve-700"
            >
              {industry}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== industry))}
                className="ml-0.5 rounded-full p-0.5 hover:bg-mauve-200 dark:hover:bg-mauve-800/50 transition-colors"
              >
                <XMarkIcon className="size-3" />
              </button>
            </span>
          ))}
          {customEntries.map((entry) => (
            <span
              key={entry}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600"
            >
              {entry}
              <button
                type="button"
                onClick={() => removeCustomEntry(entry)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <XMarkIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Other text input — shown when Other is selected */}
      {otherActive && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Other - please specify"
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}
