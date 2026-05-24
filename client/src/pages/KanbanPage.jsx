import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { taskService, projectService } from '../services';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskCard from '../components/kanban/TaskCard';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import CreateTaskModal from '../components/common/CreateTaskModal';
import Loader from '../components/common/Loader';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];

export default function KanbanPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState({ todo: [], 'in-progress': [], review: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createStatus, setCreateStatus] = useState(null);
  const [filters, setFilters] = useState({ priority: '', assignee: '', search: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const load = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectService.getOne(projectId),
        taskService.getAll({ project: projectId }),
      ]);
      setProject(projRes.data.data);
      const grouped = { todo: [], 'in-progress': [], review: [], done: [] };
      tasksRes.data.data.forEach((t) => {
        if (grouped[t.status]) grouped[t.status].push(t);
      });
      setColumns(grouped);
    } catch (err) {
      toast.error('Failed to load board');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const findColumn = (taskId) => {
    for (const col of STATUSES) {
      if (columns[col].find((t) => t._id === taskId)) return col;
    }
    return null;
  };

  const handleDragStart = ({ active }) => {
    const col = findColumn(active.id);
    if (col) setActiveTask(columns[col].find((t) => t._id === active.id));
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeCol = findColumn(active.id);
    const overCol = STATUSES.includes(over.id) ? over.id : findColumn(over.id);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const task = prev[activeCol].find((t) => t._id === active.id);
      return {
        ...prev,
        [activeCol]: prev[activeCol].filter((t) => t._id !== active.id),
        [overCol]: [...prev[overCol], task],
      };
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeCol = findColumn(active.id);
    const overCol = STATUSES.includes(over.id) ? over.id : findColumn(over.id);

    if (!activeCol || !overCol) return;

    if (activeCol === overCol) {
      const items = columns[activeCol];
      const oldIdx = items.findIndex((t) => t._id === active.id);
      const newIdx = items.findIndex((t) => t._id === over.id);
      if (oldIdx !== newIdx) {
        setColumns((prev) => ({ ...prev, [activeCol]: arrayMove(prev[activeCol], oldIdx, newIdx) }));
      }
    } else {
      try {
        await taskService.update(active.id, { status: overCol });
      } catch {
        toast.error('Failed to update task status');
        load();
      }
    }
  };

  const handleTaskCreated = (task) => {
    setColumns((prev) => ({
      ...prev,
      [task.status]: [...prev[task.status], task],
    }));
  };

  const handleTaskDeleted = (taskId) => {
    setColumns((prev) => {
      const updated = { ...prev };
      STATUSES.forEach((col) => {
        updated[col] = updated[col].filter((t) => t._id !== taskId);
      });
      return updated;
    });
  };

  const filteredColumns = () => {
    const filtered = {};
    STATUSES.forEach((col) => {
      filtered[col] = columns[col].filter((t) => {
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.assignee && t.assignee?._id !== filters.assignee) return false;
        if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
    });
    return filtered;
  };

  if (loading) return <Loader />;

  const allMembers = project?.members?.map((m) => m.user).filter(Boolean) || [];
  const isAdmin = user?.role === 'admin';
  const fc = filteredColumns();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board Header */}
      <div className="flex-shrink-0 bg-surface border-b border-outline-variant px-lg py-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-md max-w-full">
          <div className="flex items-center gap-md min-w-0">
            <Link to={`/projects/${projectId}`} className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project?.color }} />
            <h1 className="font-black text-[18px] text-on-surface tracking-tight truncate">{project?.title}</h1>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-xs ml-auto flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[15px] text-on-surface-variant">search</span>
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Filter tasks..."
                className="pl-7 pr-3 py-1 text-xs bg-surface-container-low border border-outline-variant rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 w-36"
              />
            </div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="text-xs bg-surface-container-low border border-outline-variant rounded-full px-sm py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
              className="text-xs bg-surface-container-low border border-outline-variant rounded-full px-sm py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All members</option>
              {allMembers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <button
              onClick={() => setCreateStatus('todo')}
              className="gradient-btn text-white px-md py-1 rounded-full text-xs font-semibold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-lg h-full" style={{ minWidth: 'max-content' }}>
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                id={status}
                tasks={fc[status]}
                onTaskOpen={setSelectedTask}
                onAddTask={(s) => setCreateStatus(s)}
                onDeleteTask={handleTaskDeleted}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="task-card-dragging">
                <TaskCard task={activeTask} onOpen={() => {}} onDelete={() => {}} isAdmin={isAdmin} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(t) => {
            setSelectedTask(t);
            load();
          }}
          onDeleted={handleTaskDeleted}
        />
      )}

      {/* Create Task Modal */}
      {createStatus && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setCreateStatus(null)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
