import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { taskService } from '../../services';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function TaskDetailModal({ task, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [localTask, setLocalTask] = useState(task);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { data } = await taskService.addComment(localTask._id, comment);
      setLocalTask((prev) => ({ ...prev, comments: [...(prev.comments || []), data.data] }));
      setComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(localTask._id);
      toast.success('Task deleted');
      onDeleted(localTask._id);
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <Modal title="Task Details" onClose={onClose} size="lg">
      <div className="space-y-lg">
        {/* Header info */}
        <div>
          <h2 className="text-xl font-bold text-on-surface tracking-tight">{localTask.title}</h2>
          {localTask.description && (
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{localTask.description}</p>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-md p-md bg-surface-container-low rounded-xl">
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Status</p>
            <StatusBadge status={localTask.status} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Priority</p>
            <PriorityBadge priority={localTask.priority} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Assignee</p>
            {localTask.assignee ? (
              <div className="flex items-center gap-xs">
                <Avatar user={localTask.assignee} size="xs" />
                <span className="text-sm font-medium text-on-surface">{localTask.assignee.name}</span>
              </div>
            ) : (
              <span className="text-sm text-on-surface-variant">Unassigned</span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Due Date</p>
            <span className="text-sm text-on-surface">{localTask.dueDate ? formatDate(localTask.dueDate) : '—'}</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Created by</p>
            <div className="flex items-center gap-xs">
              <Avatar user={localTask.createdBy} size="xs" />
              <span className="text-sm text-on-surface">{localTask.createdBy?.name}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Created</p>
            <span className="text-sm text-on-surface">{formatRelativeTime(localTask.createdAt)}</span>
          </div>
        </div>

        {/* Labels */}
        {localTask.labels?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Labels</p>
            <div className="flex flex-wrap gap-xs">
              {localTask.labels.map((label) => (
                <span key={label} className="text-xs font-semibold px-sm py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-md">
            Comments ({localTask.comments?.length || 0})
          </p>
          <div className="space-y-md max-h-48 overflow-y-auto mb-md">
            {localTask.comments?.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">No comments yet. Be the first!</p>
            )}
            {localTask.comments?.map((c, i) => (
              <div key={i} className="flex gap-sm">
                <Avatar user={c.user} size="sm" className="flex-shrink-0" />
                <div className="flex-1 bg-surface-container-low rounded-xl p-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-on-surface">{c.user?.name}</span>
                    <span className="text-[10px] text-on-surface-variant">{formatRelativeTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-sm">
            <Avatar user={user} size="sm" className="flex-shrink-0" />
            <div className="flex-1 flex gap-xs">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-md py-xs text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <button type="submit" disabled={posting || !comment.trim()} className="gradient-btn text-white px-md py-xs rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition flex-shrink-0">
                {posting ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-xs border-t border-outline-variant">
          <button onClick={handleDelete} className="flex items-center gap-xs text-sm text-error hover:bg-error-container/20 px-md py-xs rounded-xl transition-colors font-medium">
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete Task
          </button>
        </div>
      </div>
    </Modal>
  );
}
