import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
};

export const isOverdue = (date) => date && isPast(new Date(date)) && !isToday(new Date(date));

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
};

export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700', colColor: 'border-slate-300' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', colColor: 'border-blue-400' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-700', colColor: 'border-amber-400' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700', colColor: 'border-emerald-400' },
};

export const PROJECT_STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-secondary-container text-on-secondary-container' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
};

export const getAvatarColor = (name) => {
  const colors = [
    'bg-primary-container text-primary',
    'bg-secondary-container text-secondary',
    'bg-tertiary-container text-tertiary',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const ACTIVITY_LABELS = {
  task_created: 'created task',
  task_updated: 'updated task',
  task_deleted: 'deleted task',
  task_moved: 'moved task',
  task_assigned: 'assigned task',
  comment_added: 'commented on',
  project_created: 'created project',
  project_updated: 'updated project',
  member_added: 'added member to',
  member_removed: 'removed member from',
};
