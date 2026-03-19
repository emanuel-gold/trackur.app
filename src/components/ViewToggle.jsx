import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';

export default function ViewToggle({ view, onViewChange }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors';
  const active = 'bg-mauve-500/10 text-mauve-700 dark:bg-mauve-500/20 dark:text-mauve-300';
  const inactive = 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-950/5 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/5';

  return (
    <div className="inline-flex gap-1 rounded-lg border border-zinc-950/10 dark:border-white/10 p-0.5 bg-white dark:bg-zinc-800">
      <button
        type="button"
        onClick={() => onViewChange('board')}
        className={`${base} ${view === 'board' ? active : inactive}`}
      >
        <Squares2X2Icon className="h-4 w-4" />
        Board
      </button>
      <button
        type="button"
        onClick={() => onViewChange('table')}
        className={`${base} ${view === 'table' ? active : inactive}`}
      >
        <TableCellsIcon className="h-4 w-4" />
        Table
      </button>
    </div>
  );
}
