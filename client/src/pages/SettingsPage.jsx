import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import { getAvatarColor, getInitials } from '../utils/helpers';

const AVATAR_COLORS = [
  '#6750a4', '#4f378a', '#0277bd', '#00695c',
  '#e65100', '#ad1457', '#283593', '#558b2f',
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition';

  const TABS = [
    { id: 'profile', icon: 'person', label: 'Profile' },
    { id: 'appearance', icon: 'palette', label: 'Appearance' },
    { id: 'about', icon: 'info', label: 'About' },
  ];

  return (
    <div className="p-lg md:p-xl max-w-[800px] mx-auto animate-fade-in">
      <h1 className="text-2xl font-black text-on-background tracking-tight mb-xl">Settings</h1>

      <div className="flex gap-lg flex-col md:flex-row">
        {/* Sidebar tabs */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-md px-md py-sm rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-secondary-container/50 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-card p-lg">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-lg">
              <h2 className="text-[18px] font-bold text-on-surface tracking-tight">Profile Settings</h2>

              {/* Avatar preview */}
              <div className="flex items-center gap-lg p-lg bg-surface-container-low rounded-xl">
                <Avatar user={{ ...user, name: form.name, avatar: form.avatar }} size="xl" />
                <div>
                  <p className="font-bold text-on-surface">{form.name || user?.name}</p>
                  <p className="text-sm text-on-surface-variant">{user?.email}</p>
                  <span className={`inline-block mt-xs text-xs px-sm py-0.5 rounded-full capitalize font-semibold ${
                    user?.role === 'admin' ? 'bg-primary-container text-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Display Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Email</label>
                <input value={user?.email} disabled className={inputCls + ' opacity-50 cursor-not-allowed'} />
                <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Avatar URL (optional)</label>
                <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://example.com/avatar.jpg" className={inputCls} />
                <p className="text-xs text-on-surface-variant mt-1">Leave blank to use initials avatar.</p>
              </div>

              <button type="submit" disabled={saving} className="gradient-btn text-white px-xl py-sm rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-lg">
              <h2 className="text-[18px] font-bold text-on-surface tracking-tight">Appearance</h2>
              <div className="p-lg bg-surface-container-low rounded-xl text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md block">palette</span>
                <p className="text-sm font-semibold text-on-surface">Theme Settings</p>
                <p className="text-xs text-on-surface-variant mt-1">Dark mode and custom themes coming soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-lg">
              <h2 className="text-[18px] font-bold text-on-surface tracking-tight">About TaskFlow</h2>
              <div className="space-y-md">
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Stack', value: 'MongoDB · Express · React · Node.js' },
                  { label: 'Auth', value: 'JWT + bcrypt' },
                  { label: 'Drag & Drop', value: '@dnd-kit' },
                  { label: 'Charts', value: 'Recharts' },
                  { label: 'Styling', value: 'Tailwind CSS v3' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-sm border-b border-outline-variant last:border-0">
                    <span className="text-sm font-medium text-on-surface-variant">{label}</span>
                    <span className="text-sm font-semibold text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-md bg-primary-container/10 rounded-xl border border-primary/10">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  TaskFlow is a full-stack MERN project management platform. Built for teams who want a clean, fast, and modern workspace.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
