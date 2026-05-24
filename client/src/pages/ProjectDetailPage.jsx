import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { projectService, activityService } from '../services';
import { ProjectStatusBadge, PriorityBadge } from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { formatDate, formatRelativeTime, ACTIVITY_LABELS } from '../utils/helpers';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const load = async () => {
    try {
      const [projRes, actRes] = await Promise.all([
        projectService.getOne(id),
        activityService.getAll({ project: id, limit: 10 }),
      ]);
      setProject(projRes.data.data);
      setActivities(actRes.data.data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      const { data } = await projectService.addMember(id, memberEmail);
      setProject(data.data);
      setMemberEmail('');
      setShowAddMember(false);
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const { data } = await projectService.removeMember(id, userId);
      setProject(data.data);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <Loader />;
  if (!project) return null;

  const stats = project.taskStats || {};

  return (
    <div className="p-lg md:p-xl max-w-[1100px] mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-sm text-on-surface-variant mb-lg">
        <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{project.title}</span>
      </div>

      {/* Hero */}
      <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden mb-xl">
        <div className="h-2 w-full" style={{ background: project.color || '#6750a4' }} />
        <div className="p-xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-md mb-md">
                <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">{project.title}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-base text-on-surface-variant leading-relaxed mb-md">{project.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-md text-sm text-on-surface-variant">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Created by <strong className="text-on-surface">{project.createdBy?.name}</strong>
                </div>
                {project.dueDate && (
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">event</span>
                    Due <strong className="text-on-surface">{formatDate(project.dueDate)}</strong>
                  </div>
                )}
                <PriorityBadge priority={project.priority} />
              </div>
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-xs mt-md">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold px-sm py-0.5 bg-surface-container rounded-full text-on-surface-variant">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(`/projects/${id}/board`)}
              className="gradient-btn text-white px-xl py-sm rounded-xl font-bold text-sm flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all flex-shrink-0 self-start"
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
              Open Board
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'To Do', value: stats.todo || 0, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'In Progress', value: stats['in-progress'] || 0, color: 'text-blue-700', bg: 'bg-blue-100' },
          { label: 'In Review', value: stats.review || 0, color: 'text-amber-700', bg: 'bg-amber-100' },
          { label: 'Done', value: stats.done || 0, color: 'text-emerald-700', bg: 'bg-emerald-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-md text-center`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className={`text-xs font-semibold ${color} mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Members Panel */}
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-bold text-[16px] text-on-surface">Team Members</h3>
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="text-xs gradient-btn text-white px-sm py-1 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">person_add</span>
                Add
              </button>
            )}
          </div>
          <div className="space-y-sm">
            {project.members?.length === 0 ? (
              <EmptyState icon="group_off" title="No members" />
            ) : (
              project.members?.map((m) => {
                const member = m.user || m;
                return (
                  <div key={member._id} className="flex items-center gap-md p-sm rounded-xl hover:bg-surface-container transition-colors group">
                    <Avatar user={member} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{member.name}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{m.role || member.role}</p>
                    </div>
                    {isAdmin && m.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-error-container/20 text-error transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-lg">
          <h3 className="font-bold text-[16px] text-on-surface mb-lg">Activity Timeline</h3>
          {activities.length === 0 ? (
            <EmptyState icon="history" title="No activity yet" description="Activity on this project will appear here." />
          ) : (
            <div className="space-y-md">
              {activities.map((act, i) => (
                <div key={act._id} className="flex gap-md">
                  <div className="flex flex-col items-center">
                    <Avatar user={act.user} size="sm" />
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-outline-variant mt-2 min-h-[16px]" />}
                  </div>
                  <div className="pb-md flex-1 min-w-0">
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold">{act.user?.name}</span>{' '}
                      <span className="text-on-surface-variant">{ACTIVITY_LABELS[act.action]}</span>{' '}
                      {act.target?.title && <span className="font-medium text-primary">"{act.target.title}"</span>}
                      {act.meta?.from && (
                        <span className="text-on-surface-variant"> from <strong>{act.meta.from}</strong> to <strong>{act.meta.to}</strong></span>
                      )}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <Modal title="Add Member" onClose={() => setShowAddMember(false)} size="sm">
          <form onSubmit={handleAddMember} className="space-y-md">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Member Email</label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoFocus
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <p className="text-xs text-on-surface-variant mt-1">The user must already have a TaskFlow account.</p>
            </div>
            <div className="flex gap-md">
              <button type="button" onClick={() => setShowAddMember(false)} className="flex-1 px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">Cancel</button>
              <button type="submit" disabled={addingMember} className="flex-1 gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
                {addingMember ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
