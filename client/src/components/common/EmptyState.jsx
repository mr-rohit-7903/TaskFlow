export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">{icon || 'inbox'}</span>
      </div>
      <h3 className="text-[16px] font-semibold text-on-surface mb-2">{title}</h3>
      {description && <p className="text-sm text-on-surface-variant mb-4 max-w-sm">{description}</p>}
      {action && action}
    </div>
  );
}
