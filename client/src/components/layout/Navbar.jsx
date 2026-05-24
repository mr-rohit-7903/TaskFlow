import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateTaskModal from '../common/CreateTaskModal';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant h-16 flex items-center justify-between px-lg shadow-sm flex-shrink-0">
        {/* Left: Hamburger + Search */}
        <div className="flex items-center gap-md flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <form onSubmit={handleSearch} className="relative max-w-sm w-full hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, projects..."
              className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-xs">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <div className="w-px h-6 bg-outline-variant mx-1" />
          <button
            onClick={() => setShowCreateTask(true)}
            className="gradient-btn text-white px-lg py-2 rounded-full text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="hidden sm:inline">Create Task</span>
            <span className="sm:hidden material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </header>

      {showCreateTask && (
        <CreateTaskModal onClose={() => setShowCreateTask(false)} />
      )}
    </>
  );
}
