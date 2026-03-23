import { TrashIcon, PencilSquareIcon, ChevronUpDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { STAGES, STAGE_COLORS } from '../constants.js';
import { Badge } from './catalyst';
import useInlineEdit from '../hooks/useInlineEdit.js';
import InlineEditableField from './InlineEditableField.jsx';
import { formatDate } from '../utils/formatDate.js';

export default function JobCard({ job, onUpdate, onDelete, onEdit, onDragStart, compact, onStageChange }) {
  const { editingField, draftValue, startEdit, updateDraft, cancel, save } = useInlineEdit();

  const handleSave = () => {
    const { field, value } = save();
    if (!field) return;
    if ((field === 'company' || field === 'role') && !value.trim()) return;
    onUpdate(job.id, { [field]: value });
  };

  const isEditing = editingField !== null;

  return (
    <div
      draggable={!!onDragStart && !isEditing}
      onDragStart={onDragStart}
      className={`flex-1 flex flex-col rounded-lg bg-zinc-50 dark:bg-zinc-800 p-4 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 hover:ring-zinc-950/10 dark:hover:ring-white/15 transition-all ${!isEditing && onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <InlineEditableField
            value={job.company}
            fieldName="company"
            isEditing={editingField === 'company'}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onDraftChange={updateDraft}
            onSave={handleSave}
            onCancel={cancel}
            required
            placeholder="Company name"
            className="font-semibold text-zinc-950 dark:text-white"
          />
          <InlineEditableField
            value={job.role}
            fieldName="role"
            isEditing={editingField === 'role'}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onDraftChange={updateDraft}
            onSave={handleSave}
            onCancel={cancel}
            required
            placeholder="Role"
            className="text-sm text-zinc-500 dark:text-zinc-400"
          />
        </div>
        {!compact && !onStageChange && (
          <InlineEditableField
            value={job.stage}
            fieldName="stage"
            isEditing={editingField === 'stage'}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onDraftChange={updateDraft}
            onSave={handleSave}
            onCancel={cancel}
            inputType="select"
            selectOptions={STAGES}
            displayRender={(val) => <Badge color={STAGE_COLORS[val]?.badge || 'zinc'}>{val}</Badge>}
            className="shrink-0"
          />
        )}
        {onStageChange && (
          <div className="relative shrink-0 inline-flex items-center">
            <Badge color={STAGE_COLORS[job.stage]?.badge || 'zinc'}>
              {job.stage}
              <ChevronUpDownIcon className="inline size-5 opacity-50" />
            </Badge>
            <select
              value={job.stage}
              onChange={(e) => onStageChange(job.id, e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <InlineEditableField
        value={job.dateApplied}
        fieldName="dateApplied"
        isEditing={editingField === 'dateApplied'}
        draftValue={draftValue}
        onStartEdit={startEdit}
        onDraftChange={updateDraft}
        onSave={handleSave}
        onCancel={cancel}
        inputType="date"
        placeholder="Set applied date"
        displayRender={(val) => val ? <span>Applied {formatDate(val)}</span> : null}
        className="mt-2 text-xs text-zinc-500 dark:text-zinc-400"
      />
      
      {/* next steps badge */}
      <div className="rounded mt-2 shadow-md -mx-1.5 px-1.5 py-1 text-xs border border-mauve-300  bg-mauve-200 dark:border-mauve-800 dark:bg-mauve-700">
        <div className="text-zinc-600 dark:text-zinc-300">
          <InlineEditableField
            value={job.nextAction}
            fieldName="nextAction"
            isEditing={editingField === 'nextAction'}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onDraftChange={updateDraft}
            onSave={handleSave}
            onCancel={cancel}
            placeholder="Add next action"
            displayRender={(val) => val ? <span><span className="font-medium">Next step:</span> {val}</span> : null}
          />
        </div>

        {(job.nextActionDate || editingField === 'nextActionDate') && (
          <div className="mt-0.5 text-zinc-500 dark:text-zinc-400">
            <InlineEditableField
              value={job.nextActionDate}
              fieldName="nextActionDate"
              isEditing={editingField === 'nextActionDate'}
              draftValue={draftValue}
              onStartEdit={startEdit}
              onDraftChange={updateDraft}
              onSave={handleSave}
              onCancel={cancel}
              inputType="date"
              placeholder="Set action date"
              displayRender={(val) => val ?
              <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {formatDate(val)}</span> : null}
            />
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        <InlineEditableField
          value={job.notes}
          fieldName="notes"
          isEditing={editingField === 'notes'}
          draftValue={draftValue}
          onStartEdit={startEdit}
          onDraftChange={updateDraft}
          onSave={handleSave}
          onCancel={cancel}
          inputType="textarea"
          placeholder="Add notes"
          displayRender={(val) => val ? <span className="line-clamp-2">{val}</span> : null}
        />
      </div>

      <div className="mt-auto flex gap-1 border-t border-zinc-950/5 dark:border-white/5 pt-2">
        <button
          type="button"
          onClick={() => onEdit(job.id)}
          className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-zinc-500 hover:text-mauve-600 hover:bg-mauve-50 dark:text-zinc-400 dark:hover:text-mauve-400 dark:hover:bg-mauve-950/50 transition-colors"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(job.id)}
          className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-colors"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
