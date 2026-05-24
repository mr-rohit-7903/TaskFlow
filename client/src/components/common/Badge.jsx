import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/helpers';

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

export function ProjectStatusBadge({ status }) {
  const labels = {
    planning: { label: 'Planning', class: 'bg-secondary-container text-on-secondary-container' },
    active: { label: 'Active', class: 'bg-emerald-100 text-emerald-700' },
    'on-hold': { label: 'On Hold', class: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', class: 'bg-blue-100 text-blue-700' },
  };
  const config = labels[status] || labels.planning;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.class}`}>
      {config.label}
    </span>
  );
}
