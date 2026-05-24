import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { taskService, projectService } from '../services';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import CreateTaskModal from '../components/common/CreateTaskModal';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import { formatDate, isOverdue } from '../utils/helpers';

export default function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: '',
    priority: '',
    project: '',
    assignee: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.project) params.project = filters.project;
      if (filters.search) params.search = filters.search;
      if (filters.assignee === 'me') params.assignee = user._id;
      else if (filters.assignee) params.assignee = filters.assignee;

      const [tasksRes, projRes] = await Promise.all([
        taskService.getAll(params),
        projectService.getAll(),
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projRes.data.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, user._id]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setSelectedTask(null);
  };

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ search: '', status: '', priority: '', project: '', assignee: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  const inputCls = 'bg-surface-container-lowest border border-outline-variant rounded-xl px-sm py-xs text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition';

  return (
    <div className="p-lg md:p-xl max-w-[1100px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-2xl font-black text-on-background tracking-tight">Tasks</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-card">
        <div className="flex flex-wrap gap-sm items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-on-surface-variant">search</span>
            <input
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-xs bg-surface-container-low border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={inputCls}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} className={inputCls}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select value={filters.project} onChange={(e) => setFilter('project', e.target.value)} className={inputCls}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>

          <select value={filters.assignee} onChange={(e) => setFilter('assignee', e.target.value)} className={inputCls}>
            <option value="">All Assignees</option>
            <option value="me">Assigned to me</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? <Loader /> : tasks.length === 0 ? (
        <EmptyState
          icon="task_alt"
          title="No tasks found"
          description={hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
          action={
            <button onClick={() => setShowCreate(true)} className="gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold">
              Create Task
            </button>
          }
        />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-sm px-lg py-sm border-b border-outline-variant bg-surface-container-low">
            <span className="col-span-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Task</span>
            <span className="col-span-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:block">Status</span>
            <span className="col-span-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden md:block">Priority</span>
            <span className="col-span-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden lg:block">Assignee</span>
            <span className="col-span-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden lg:block">Due</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-outline-variant">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate);
              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className="grid grid-cols-12 gap-sm px-lg py-md hover:bg-surface-container-low cursor-pointer transition-colors group items-center"
                >
                  {/* Title */}
                  <div className="col-span-5 min-w-0">
                    <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {task.title}
                    </p>
                    {task.project?.title && (
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{task.project.title}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 hidden sm:block">
                    <StatusBadge status={task.status} />
                  </div>

                  {/* Priority */}
                  <div className="col-span-2 hidden md:block">
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {/* Assignee */}
                  <div className="col-span-2 hidden lg:flex items-center gap-xs">
                    {task.assignee ? (
                      <>
                        <Avatar user={task.assignee} size="xs" />
                        <span className="text-xs text-on-surface truncate">{task.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </div>

                  {/* Due date */}
                  <div className="col-span-1 hidden lg:block">
                    {task.dueDate ? (
                      <span className={`text-xs font-medium ${overdue ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(t) => setSelectedTask(t)}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
