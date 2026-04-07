import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CHAR_LIMITS } from '../constants.js';

export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter', name }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag) => {
    onChange(value.filter((v) => v !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-mauve-100 px-3 py-1.5 text-sm font-medium text-mauve-700 ring-1 ring-inset ring-mauve-300 dark:bg-mauve-900/30 dark:text-mauve-300 dark:ring-mauve-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-mauve-200 dark:hover:bg-mauve-800/50 transition-colors"
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={input}
          maxLength={CHAR_LIMITS.jobTitle}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border-0 bg-transparent px-3.5 py-2 text-sm text-zinc-950 ring-1 ring-zinc-950/10 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mauve-500 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-500"
        />
        {input.length >= CHAR_LIMITS.jobTitle && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500 dark:text-red-400">Max {CHAR_LIMITS.jobTitle} characters.</span>
        )}
      </div>
    </div>
  );
}
