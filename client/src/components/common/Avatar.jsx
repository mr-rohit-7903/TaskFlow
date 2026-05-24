import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-[13px]',
    lg: 'w-11 h-11 text-[15px]',
    xl: 'w-14 h-14 text-[18px]',
  };

  if (!user) {
    return (
      <div className={`${sizes[size]} rounded-full bg-surface-container-high flex items-center justify-center ${className}`}>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>person</span>
      </div>
    );
  }

  return (
    <div
      title={user.name}
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden ${getAvatarColor(user.name)} ${className}`}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        getInitials(user.name)
      )}
    </div>
  );
}
