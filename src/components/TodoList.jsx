import { useState, useRef } from 'react';
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { MAX_TODOS, CHAR_LIMITS } from '../constants.js';
import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onAdd, onToggle, onRemove, onUpdate, maxItems = MAX_TODOS }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDate, setShowDate] = useState(false);
  const inputRef = useRef(null);
  const dateRef = useRef(null);

  const atLimit = todos.length >= maxItems;

  const handleAdd = () => {
    if (!text.trim() || atLimit) return;
    onAdd(text, dueDate || null);
    setText('');
    setDueDate('');
    setShowDate(false);
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Todo items */}
      {todos.length > 0 && (
        <div className="divide-y divide-zinc-950/5 dark:divide-white/5">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}

      {/* Add row */}
      {!atLimit && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <PlusIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={text}
              maxLength={CHAR_LIMITS.todo}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="Add a step..."
              className="flex-1 bg-transparent text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
            />
            {text.length >= CHAR_LIMITS.todo && (
              <span className="shrink-0 text-xs text-red-500 dark:text-red-400">Max {CHAR_LIMITS.todo} characters.</span>
            )}
            <button
              type="button"
              onClick={() => {
                setShowDate(!showDate);
                if (!showDate) {
                  setTimeout(() => {
                    dateRef.current?.focus();
                    try { dateRef.current?.showPicker?.(); } catch { /* ignore */ }
                  }, 50);
                }
              }}
              className={`shrink-0 p-1 rounded transition-colors ${
                dueDate
                  ? 'text-violet-500 dark:text-violet-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-violet-500 dark:hover:text-violet-400'
              }`}
            >
              <CalendarIcon className="size-4" />
            </button>
            {text.trim() && (
              <button
                type="button"
                onClick={handleAdd}
                className="shrink-0 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Add
              </button>
            )}
          </div>
          {showDate && (
            <div className="mt-1.5 ml-6">
              <input
                ref={dateRef}
                type="date" 
                min="2000-01-01" 
                max="2099-12-31" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs bg-transparent text-zinc-500 dark:text-zinc-400 outline-none border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Counter */}
      {todos.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {todos.filter((t) => t.completed).length}/{todos.length} done
          {atLimit && ' (limit reached)'}
        </p>
      )}
    </div>
  );
}
