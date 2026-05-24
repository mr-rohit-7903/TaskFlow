import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services';
import ProjectCard from '../components/common/ProjectCard';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const STATUS_FILTERS = ['all', 'planning', 'active', 'on-hold', 'completed'];

const defaultForm = { title: '', description: '', status: 'planning', priority: 'medium', color: '#6750a4', dueDate: '', tags: '' };

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await projectService.getAll();
      setProjects(data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(defaultForm); setEditProject(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ ...p, tags: p.tags?.join(', ') || '', dueDate: p.dueDate ? p.dueDate.split('T')[0] : '' });
    setEditProject(p);
    setShowForm(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] };
      if (editProject) {
        const { data } = await projectService.update(editProject._id, payload);
        setProjects((prev) => prev.map((p) => p._id === editProject._id ? { ...p, ...data.data } : p));
        toast.success('Project updated!');
      } else {
        await projectService.create(payload);
        toast.success('Project created!');
        await load();
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await projectService.delete(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Project deleted');
      setDeleteTarget(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = projects.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

  return (
    <div className="p-lg md:p-xl max-w-[1200px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-2xl font-black text-on-background tracking-tight">Projects</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all self-start">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-md mb-lg">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-9 pr-4 py-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
        </div>
        <div className="flex gap-xs overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-md py-sm rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${filter === s ? 'gradient-btn text-white shadow-md' : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:border-primary/40'}`}>
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState icon="folder_off" title="No projects found" description={isAdmin ? "Create your first project to get started." : "You haven't been added to any projects yet."}
          action={isAdmin && <button onClick={openCreate} className="gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold">Create Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} isAdmin={isAdmin} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal title={editProject ? 'Edit Project' : 'New Project'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Project name" className={inputCls} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="What's this project about?" className={inputCls + ' resize-none'} />
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Accent Color</label>
                <div className="flex items-center gap-md">
                  <input type="color" name="color" value={form.color} onChange={handleChange} className="w-10 h-10 rounded-lg border border-outline-variant cursor-pointer p-0.5" />
                  <span className="text-xs text-on-surface-variant">{form.color}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="frontend, api, design..." className={inputCls} />
            </div>
            <div className="flex gap-md pt-xs">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 gradient-btn text-white px-lg py-sm rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
                {saving ? 'Saving...' : editProject ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal title="Delete Project" onClose={() => setDeleteTarget(null)} size="sm">
          <div className="space-y-md">
            <p className="text-sm text-on-surface-variant">Are you sure you want to delete <strong className="text-on-surface">{deleteTarget.title}</strong>? This will also delete all tasks in this project.</p>
            <div className="flex gap-md">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-error text-white px-lg py-sm rounded-xl text-sm font-semibold hover:bg-error/90 transition">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
