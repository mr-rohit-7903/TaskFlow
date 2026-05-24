import { useNavigate } from 'react-router-dom';
import { ProjectStatusBadge, PriorityBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/helpers';

export default function ProjectCard({ project, onEdit, onDelete, isAdmin }) {
  const navigate = useNavigate();
  const stats = project.taskStats || {};
  const total = stats.total || 0;
  const done = stats.done || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card hover:shadow-float transition-all group flex flex-col overflow-hidden">
      {/* Color strip */}
      <div className="h-1.5 w-full" style={{ background: project.color || '#6750a4' }} />

      <div className="p-lg flex flex-col flex-1 gap-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-md">
          <div className="min-w-0">
            <h3 className="font-bold text-[16px] text-on-surface truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project); }}
                className="p-1.5 rounded-lg hover:bg-error-container/20 text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-xs">
          <ProjectStatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          {project.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[11px] px-2 py-0.5 bg-surface-container rounded-full text-on-surface-variant font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-on-surface-variant font-medium mb-1.5">
            <span>{total} tasks</span>
            <span className="text-primary font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: project.color || '#6750a4' }}
            />
          </div>
          <div className="flex gap-md mt-xs text-[11px] text-on-surface-variant">
            <span>{done} done</span>
            <span>{stats['in-progress'] || 0} in progress</span>
            <span>{stats.todo || 0} to do</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-xs border-t border-outline-variant">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((m) => (
              <Avatar key={m.user?._id || m._id} user={m.user || m} size="xs" className="ring-2 ring-white" />
            ))}
            {project.members?.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-surface-container-high ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-on-surface-variant">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex gap-xs">
            <button
              onClick={() => navigate(`/projects/${project._id}`)}
              className="text-xs text-on-surface-variant hover:text-primary font-medium px-sm py-1 rounded-lg hover:bg-surface-container transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => navigate(`/projects/${project._id}/board`)}
              className="text-xs gradient-btn text-white font-semibold px-sm py-1 rounded-lg hover:opacity-90 transition-opacity"
            >
              Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
