import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/projects', icon: 'folder', label: 'Projects' },
  { to: '/tasks', icon: 'assignment', label: 'Tasks' },
  { to: '/team', icon: 'groups', label: 'Team' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ mobile, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNav = () => { if (mobile && onClose) onClose(); };

  return (
    <aside className="bg-surface-container-low border-r border-outline-variant h-full w-[260px] flex flex-col py-lg px-md shadow-sm">
      {/* Logo */}
      <div className="mb-xl px-xs flex items-center gap-md">
        <div>
          <h1 className="text-[20px] font-black text-primary leading-tight tracking-tight">TaskFlow</h1>
          <p className="text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase">Enterprise</p>
        </div>
        {mobile && (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNav}
            className={({ isActive }) =>
              `flex items-center gap-md px-md py-sm rounded-xl text-[14px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-secondary-container/50 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-lg border-t border-outline-variant space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-md px-md py-sm rounded-xl text-[14px] text-error hover:bg-error-container/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-md px-md py-sm mt-xs">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${getAvatarColor(user?.name)}`}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-on-surface truncate">{user?.name}</p>
            <p className="text-[11px] text-on-surface-variant truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
