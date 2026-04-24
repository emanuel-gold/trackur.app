import { memo, useRef, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default memo(function InlineEditableField({
  value,
  fieldName,
  label,
  isEditing,
  draftValue,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
  onBlur,
  inputType = 'text',
  selectOptions,
  displayRender,
  placeholder,
  required,
  multiline,
  maxLength,
  className = '',
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputType === 'text' || inputType === 'textarea') {
        inputRef.current.select();
      }
    }
  }, [isEditing, inputType]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputType !== 'textarea') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const actionButtons = (
    <span className="inline-flex shrink-0 gap-0.5 ml-1">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="rounded-sm p-0.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors"
        title="Save"
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
        className="rounded-sm p-0.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
        title="Cancel"
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );

  if (isEditing) {
    const inputClasses = 'w-full rounded-sm border border-zinc-950/30 dark:border-white/30 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white px-1.5 py-0.5 text-sm focus:border-mauve-500 focus:ring-1 focus:ring-mauve-500 outline-none';

    let input;
    if (inputType === 'select') {
      input = (
        <select
          ref={inputRef}
          value={draftValue}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          aria-label={label || `Select ${fieldName}`}
          className={inputClasses}
        >
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    } else if (inputType === 'textarea') {
      input = (
        <textarea
          ref={inputRef}
          value={draftValue}
          maxLength={maxLength}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          rows={2}
          className={`${inputClasses} resize-none`}
          placeholder={placeholder}
        />
      );
    } else {
      input = (
        <input
          ref={inputRef}
          type={inputType}
          value={draftValue}
          maxLength={maxLength}
          {...(inputType === 'date' ? { min: '2000-01-01', max: '2099-12-31' } : {})}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          className={inputClasses}
          placeholder={placeholder}
        />
      );
    }

    let counterEl = null;
    if (maxLength) {
      if (inputType === 'textarea') {
        const remaining = maxLength - draftValue.length;
        const color = remaining <= 15
          ? 'text-red-500 dark:text-red-400'
          : draftValue.length >= maxLength * 0.75
            ? 'text-yellow-500 dark:text-yellow-400'
            : 'text-zinc-500 dark:text-zinc-400';
        counterEl = <span className={`text-xs ${color}`}>{draftValue.length}/{maxLength}</span>;
      } else if (draftValue.length >= maxLength) {
        counterEl = <span className="text-xs text-red-500 dark:text-red-400">Max {maxLength} characters.</span>;
      }
    }

    return (
      <div className={className}>
        <div className="flex items-start gap-1">
          <div className="flex-1 min-w-0">{input}</div>
          {actionButtons}
        </div>
        {counterEl}
      </div>
    );
  }

  // Display mode
  const hasValue = value !== undefined && value !== null && value !== '';
  const displayLabel = label || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

  // If displayRender returns null for empty values, hide the field entirely
  if (displayRender && !hasValue) {
    const rendered = displayRender(value);
    if (rendered === null) return null;
  }

  const displayContent = displayRender
    ? displayRender(value)
    : hasValue
      ? value
      : <span className="text-zinc-500 dark:text-zinc-400 italic">{placeholder || 'Empty'}</span>;

  return (
    <div
      className={`group/field flex ${multiline ? 'items-start' : 'items-center'} gap-1 min-w-0 cursor-pointer border-b border-transparent hover:border-mauve-400 dark:hover:border-mauve-500 transition-colors ${className}`}
      onClick={() => onStartEdit(fieldName, value ?? '')}
      title={`Edit ${displayLabel}`}
    >
      <span className={`min-w-0 flex-1 ${multiline ? '' : 'truncate'}`}>{displayContent}</span>
      <PencilIcon className="h-4 w-4 shrink-0 text-zinc-400 opacity-0 group-hover/field:opacity-100 dark:text-zinc-500 transition-opacity" />
    </div>
  );
});
