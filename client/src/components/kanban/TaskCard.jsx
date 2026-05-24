import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate, isOverdue } from '../../utils/helpers';

export default function TaskCard({ task, onOpen, onDelete, isAdmin }) {
  const [hover, setHover] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const overdue = isOverdue(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`glass-surface rounded-xl p-md cursor-grab active:cursor-grabbing transition-all duration-150 select-none
        ${isDragging ? 'shadow-float rotate-1 scale-105' : 'hover:shadow-float hover:-translate-y-0.5'}
        ${overdue ? 'border-error/30 bg-error-container/5' : ''}
      `}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-sm">
          {task.labels.slice(0, 3).map((label) => (
            <span key={label} className="text-[10px] font-bold px-xs py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-on-surface leading-snug mb-sm line-clamp-2">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-on-surface-variant line-clamp-2 mb-sm">{task.description}</p>
      )}

      {/* Priority */}
      <div className="mb-sm">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-xs">
        <div className="flex items-center gap-xs min-w-0">
          {task.assignee ? (
            <Avatar user={task.assignee} size="xs" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-container-high border border-dashed border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
            </div>
          )}
          {task.dueDate && (
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${overdue ? 'text-error' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-[12px]">event</span>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
              {task.comments.length}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(task); }}
            className={`p-1 rounded-lg transition-all ${hover ? 'opacity-100' : 'opacity-0'} hover:bg-surface-container-high text-on-surface-variant`}
          >
            <span className="material-symbols-outlined text-[14px]">open_in_full</span>
          </button>
        </div>
      </div>
    </div>
  );
}
