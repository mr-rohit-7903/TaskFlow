import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const COLUMN_STYLES = {
  todo: { dot: 'bg-slate-400', header: 'border-slate-300', badge: 'bg-slate-100 text-slate-600' },
  'in-progress': { dot: 'bg-blue-500', header: 'border-blue-400', badge: 'bg-blue-100 text-blue-700' },
  review: { dot: 'bg-amber-500', header: 'border-amber-400', badge: 'bg-amber-100 text-amber-700' },
  done: { dot: 'bg-emerald-500', header: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
};

const COLUMN_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function KanbanColumn({ id, tasks, onTaskOpen, onAddTask, onDeleteTask, isAdmin }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const style = COLUMN_STYLES[id];

  return (
    <div className={`kanban-column flex flex-col bg-surface-container-low rounded-xl border-t-2 ${style.header} transition-all ${isOver ? 'bg-primary-container/10 shadow-float' : ''}`}>
      {/* Column header */}
      <div className="flex items-center justify-between px-md py-sm">
        <div className="flex items-center gap-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <h3 className="text-sm font-bold text-on-surface">{COLUMN_LABELS[id]}</h3>
          <span className={`text-[11px] font-bold px-xs py-0.5 rounded-full ${style.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          title="Add task"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Tasks list */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-md pb-md space-y-sm overflow-y-auto min-h-[100px] transition-colors ${isOver ? 'bg-primary-container/5 rounded-xl' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onOpen={onTaskOpen}
              onDelete={onDeleteTask}
              isAdmin={isAdmin}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(id)}
            className="h-20 rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant text-xs font-medium cursor-pointer hover:border-primary/40 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">add</span>
            Add task
          </div>
        )}
      </div>
    </div>
  );
}
