import { NavLink } from 'react-router-dom';

const MOBILE_ITEMS = [
  { to: '/dashboard', icon: 'home', label: 'Home' },
  { to: '/tasks', icon: 'list_alt', label: 'Tasks' },
  { to: '/projects', icon: 'folder', label: 'Projects' },
  { to: '/team', icon: 'group', label: 'Team' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden bg-surface-container-highest border-t border-outline-variant flex justify-around items-center h-16 px-md flex-shrink-0 z-50">
      {MOBILE_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive
                ? 'bg-primary-container text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="text-[10px] font-semibold">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
