import { useState, useRef, useCallback, useEffect } from 'react';
import { STAGES, STAGE_COLORS } from '../constants.js';
import { Badge } from './catalyst';
import JobCard from './JobCard.jsx';

function MobileStageRow({ stage, stageJobs, onUpdate, onDelete, onEdit, onUpdateStage }) {
  const scrollRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const gap = 12;
    const cardWidth = el.firstElementChild.offsetWidth + gap;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveCard(Math.min(index, stageJobs.length - 1));
  }, [stageJobs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToCard = useCallback((index) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[index];
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{stage}</h3>
        <Badge color={STAGE_COLORS[stage].badge}>{stageJobs.length}</Badge>
      </div>

      {stageJobs.length === 0 ? (
        <p className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-mauve-200/50 dark:bg-mauve-950/20 rounded-lg">
          No jobs
        </p>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory pb-1"
          >
            {stageJobs.map((job) => (
              <div key={job.id} className="shrink-0 w-[80%] snap-start flex">
                <JobCard
                  job={job}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onStageChange={onUpdateStage}
                  compact
                />
              </div>
            ))}
          </div>
          {stageJobs.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-1.5">
              {stageJobs.map((job, i) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  aria-label={`Card ${i + 1}`}
                  className={`size-1.5 rounded-full transition-colors ${i === activeCard ? 'bg-mauve-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function KanbanBoard({ jobs, onUpdate, onDelete, onEdit, onUpdateStage }) {
  const [dragOverStage, setDragOverStage] = useState(null);

  const jobsByStage = {};
  STAGES.forEach((stage) => {
    jobsByStage[stage] = jobs.filter((j) => j.stage === stage);
  });

  function handleDragStart(e, jobId) {
    e.dataTransfer.setData('text/plain', String(jobId));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, stage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  function handleDragLeave(e, stage) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(null);
    }
  }

  function handleDrop(e, stage) {
    e.preventDefault();
    setDragOverStage(null);
    const jobId = Number(e.dataTransfer.getData('text/plain'));
    if (jobId && onUpdateStage) {
      onUpdateStage(jobId, stage);
    }
  }

  return (
    <div>
      {/* Mobile: stages stacked vertically, cards scroll horizontally */}
      <div className="md:hidden space-y-5">
        {STAGES.map((stage) => (
          <MobileStageRow
            key={stage}
            stage={stage}
            stageJobs={jobsByStage[stage]}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateStage={onUpdateStage}
          />
        ))}
      </div>

      {/* Desktop: original horizontal columns */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 min-h-[75vh]">
        {STAGES.map((stage) => {
          const stageJobs = jobsByStage[stage];
          const isDragOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className={`shrink-0 w-72 rounded-lg bg-mauve-200 dark:bg-mauve-950/40 transition-all ${isDragOver ? 'ring-2 ring-mauve-400 dark:ring-mauve-500' : 'ring-1 ring-mauve-300/50 dark:ring-mauve-800/30'}`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={(e) => handleDragLeave(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-mauve-300/50 dark:border-mauve-800/30">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{stage}</h3>
                <Badge color={STAGE_COLORS[stage].badge}>{stageJobs.length}</Badge>
              </div>

              <div className="p-2 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {stageJobs.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No jobs</p>
                ) : (
                  stageJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      compact
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
