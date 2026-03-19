import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { STAGES } from '../constants.js';
import { InputGroup, Input, Select, Button } from './catalyst';

export default function FilterBar({ search, onSearchChange, stageFilter, onStageFilterChange, hideStageFilter, hideMobileExtras }) {
  const hasFilters = search || stageFilter;

  return (
    <div className="flex flex-1 md:flex-initial flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-0 md:max-w-sm">
        <InputGroup>
          <MagnifyingGlassIcon data-slot="icon" />
          <Input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>

      {!hideStageFilter && (
        <Select
          value={stageFilter}
          onChange={(e) => onStageFilterChange(e.target.value)}
          className={`w-auto ${hideMobileExtras ? 'hidden md:block' : ''}`}
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      )}

      {hasFilters && (
        <Button
          plain
          onClick={() => { onSearchChange(''); onStageFilterChange(''); }}
          className={hideMobileExtras ? 'hidden md:inline-flex' : ''}
        >
          <XMarkIcon data-slot="icon" />
          Clear
        </Button>
      )}
    </div>
  );
}
