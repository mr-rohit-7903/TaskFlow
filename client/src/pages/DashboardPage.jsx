import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { taskService, activityService, projectService } from '../services';
import { formatRelativeTime, formatDate, isOverdue, ACTIVITY_LABELS } from '../utils/helpers';
import Loader from '../components/common/Loader';
import Avatar from '../components/common/Avatar';
import { PriorityBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import CreateTaskModal from '../components/common/CreateTaskModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Simulate weekly productivity data
  const weekData = DAYS.map((day, i) => ({
    day,
    tasks: Math.floor(Math.random() * 15) + 3,
  }));

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes, tasksRes] = await Promise.all([
          taskService.getStats(),
          activityService.getAll({ limit: 6 }),
          taskService.getAll({ status: 'in-progress' }),
        ]);
        setStats(statsRes.data.data);
        setActivities(activityRes.data.data);
        const overdue = tasksRes.data.data.filter((t) => t.dueDate).slice(0, 4);
        setUrgentTasks(overdue);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const STAT_CARDS = [
    { label: 'Total Projects', value: stats?.projects ?? 0, icon: 'folder', iconBg: 'bg-primary-container/20 text-primary' },
    { label: 'Total Tasks', value: stats?.total ?? 0, icon: 'assignment', iconBg: 'bg-secondary-container/40 text-secondary' },
    { label: 'Completed', value: stats?.done ?? 0, icon: 'check_circle', iconBg: 'bg-emerald-100 text-emerald-700' },
    { label: 'In Progress', value: stats?.['in-progress'] ?? 0, icon: 'pending_actions', iconBg: 'bg-blue-100 text-blue-700' },
  ];

  const completionPct = stats?.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="p-lg md:p-xl space-y-xl max-w-[1200px] mx-auto animate-fade-in">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-on-background tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-base text-on-surface-variant mt-1">Here's what's happening in TaskFlow today.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </button>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {STAT_CARDS.map(({ label, value, icon, iconBg }) => (
          <div key={label} className="glass-surface p-md rounded-xl hover:shadow-float transition-all group">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </div>
            </div>
            <span className="text-2xl font-black text-on-surface">{value}</span>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Productivity Chart */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-[18px] font-bold text-on-surface tracking-tight">Team Productivity</h3>
            <div className="flex items-center gap-xs text-xs text-on-surface-variant font-medium">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Tasks completed
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#494551' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e6e0e9', borderRadius: 12, fontSize: 13 }}
                cursor={{ fill: 'rgba(103,80,164,0.05)' }}
              />
              <Bar dataKey="tasks" radius={[8, 8, 0, 0]}>
                {weekData.map((entry, index) => (
                  <Cell key={index} fill={index === 3 ? '#4f378a' : '#e9ddff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Completion meter */}
          <div className="mt-md pt-md border-t border-outline-variant">
            <div className="flex justify-between text-xs text-on-surface-variant font-medium mb-2">
              <span>Sprint completion</span>
              <span className="text-primary font-bold">{completionPct}%</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full gradient-btn rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Urgent Tasks */}
        <section className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-[18px] font-bold text-on-surface tracking-tight">Urgent Deadlines</h3>
            <button onClick={() => navigate('/tasks')} className="text-xs text-primary font-semibold hover:underline">
              View all
            </button>
          </div>
          <div className="flex-1 space-y-sm overflow-y-auto">
            {urgentTasks.length === 0 ? (
              <EmptyState icon="event_available" title="No urgent tasks" description="You're all caught up!" />
            ) : (
              urgentTasks.map((task) => {
                const overdue = isOverdue(task.dueDate);
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/projects/${task.project?._id || task.project}/board`)}
                    className={`p-md rounded-xl border cursor-pointer hover:shadow-card transition-all ${
                      overdue ? 'bg-error-container/10 border-error/20' : 'bg-surface-container-low border-outline-variant hover:border-primary/40'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-xs">
                      <p className="text-sm font-semibold text-on-surface leading-tight line-clamp-1">{task.title}</p>
                      {overdue && <span className="text-[10px] font-bold bg-error text-white px-xs py-0.5 rounded flex-shrink-0">OVERDUE</span>}
                    </div>
                    <div className="flex items-center gap-xs mt-xs">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">schedule</span>
                      <span className="text-[11px] text-on-surface-variant">{formatDate(task.dueDate)}</span>
                      <span className="ml-auto"><PriorityBadge priority={task.priority} /></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-[18px] font-bold text-on-surface tracking-tight">Recent Activity</h3>
          </div>
          {activities.length === 0 ? (
            <EmptyState icon="history" title="No activity yet" description="Actions on tasks and projects will appear here." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {activities.map((act, i) => (
                <div key={act._id} className="flex gap-md group">
                  <div className="flex flex-col items-center">
                    <Avatar user={act.user} size="sm" />
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-outline-variant mt-2 min-h-[20px]" />}
                  </div>
                  <div className="pb-md min-w-0">
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold">{act.user?.name}</span>{' '}
                      <span className="text-on-surface-variant">{ACTIVITY_LABELS[act.action]}</span>{' '}
                      <span className="font-medium text-primary truncate">{act.target?.title}</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{formatRelativeTime(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
