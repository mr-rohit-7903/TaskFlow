import { useEffect } from 'react';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-surface-container-lowest rounded-2xl shadow-modal w-full ${sizes[size]} animate-slide-up flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant flex-shrink-0">
          <h2 className="text-[18px] font-semibold text-on-surface tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
