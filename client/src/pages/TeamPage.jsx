import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { formatRelativeTime } from '../utils/helpers';

const ROLE_BADGE = {
  admin: 'bg-primary-container text-primary font-bold',
  member: 'bg-surface-container text-on-surface-variant',
};

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await userService.getAll();
      setUsers(data.data);
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, role) => {
    setSaving(true);
    try {
      const { data } = await userService.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => u._id === userId ? data.data : u));
      setEditUser(null);
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success('User removed');
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-lg md:p-xl max-w-[900px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-2xl font-black text-on-background tracking-tight">Team</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''} in TaskFlow</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-lg">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members..."
          className="w-full pl-9 pr-4 py-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>

      {/* Team grid */}
      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState icon="group_off" title="No members found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {filtered.map((u) => (
            <div key={u._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-card hover:shadow-float transition-all group flex flex-col items-center text-center">
              <Avatar user={u} size="xl" className="mb-md" />
              <h3 className="font-bold text-[16px] text-on-surface">{u.name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate w-full">{u.email}</p>
              <span className={`mt-sm text-[11px] px-sm py-0.5 rounded-full capitalize ${ROLE_BADGE[u.role]}`}>
                {u.role}
              </span>
              <p className="text-[11px] text-on-surface-variant mt-xs">
                Joined {formatRelativeTime(u.createdAt)}
              </p>

              {isAdmin && u._id !== currentUser._id && (
                <div className="flex gap-xs mt-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditUser(u)}
                    className="text-xs px-sm py-1 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors font-medium"
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="text-xs px-sm py-1 rounded-lg bg-error-container/20 text-error hover:bg-error-container/40 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              {u._id === currentUser._id && (
                <span className="mt-md text-[10px] bg-primary-container/20 text-primary font-bold px-sm py-0.5 rounded-full">You</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit role modal */}
      {editUser && (
        <Modal title={`Edit Role: ${editUser.name}`} onClose={() => setEditUser(null)} size="sm">
          <div className="space-y-md">
            <p className="text-sm text-on-surface-variant">Change the role for <strong className="text-on-surface">{editUser.name}</strong>.</p>
            <div className="grid grid-cols-2 gap-md">
              {['admin', 'member'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(editUser._id, role)}
                  disabled={saving || editUser.role === role}
                  className={`py-md rounded-xl border-2 font-semibold text-sm capitalize transition-all ${
                    editUser.role === role
                      ? 'border-primary bg-primary-container/20 text-primary'
                      : 'border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-primary'
                  } disabled:opacity-50`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button onClick={() => setEditUser(null)} className="w-full px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal title="Remove Member" onClose={() => setDeleteTarget(null)} size="sm">
          <div className="space-y-md">
            <p className="text-sm text-on-surface-variant">
              Remove <strong className="text-on-surface">{deleteTarget.name}</strong> from TaskFlow? This action cannot be undone.
            </p>
            <div className="flex gap-md">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-lg py-sm rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-error text-white px-lg py-sm rounded-xl text-sm font-semibold hover:bg-error/90 transition">Remove</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
