import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { taskService, projectService, userService } from '../../services';

export default function CreateTaskModal({ onClose, projectId, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', status: 'todo',
    project: projectId || '', assignee: '', dueDate: '', labels: '',
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    projectService.getAll().then(({ data }) => setProjects(data.data));
  }, []);

  useEffect(() => {
    if (form.project) {
      const proj = projects.find((p) => p._id === form.project);
      if (proj) setMembers(proj.members?.map((m) => m.user).filter(Boolean) || []);
    }
  }, [form.project, projects]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project) {
      return toast.error('Title and project are required');
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        labels: form.labels ? form.labels.split(',').map((l) => l.trim()) : [],
        assignee: form.assignee || undefined,
        dueDate: form.dueDate || undefined,
      };
      const { data } = await taskService.create(payload);
      toast.success('Task created!');
      if (onCreated) onCreated(data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

  return (
    <Modal title="Create New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-md">
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Task title..." className={inputCls} autoFocus />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Add details..." className={inputCls + ' resize-none'} />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Project *</label>
            <select name="project" value={form.project} onChange={handleChange} className={inputCls}>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Assignee</label>
            <select name="assignee" value={form.assignee} onChange={handleChange} className={inputCls}>
              <option value="">Unassigned</option>
              {members.map((m) => m && <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">Labels (comma separated)</label>
            <input name="labels" value={form.labels} onChange={handleChange} placeholder="design, backend..." className={inputCls} />
          </div>
        </div>

        <div className="flex gap-md pt-xs">
          <button type="button" onClick={onClose} className="flex-1 px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
