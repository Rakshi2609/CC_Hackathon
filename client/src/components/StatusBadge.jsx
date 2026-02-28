export default function StatusBadge({ status }) {
  const config = {
    pending: { label: 'PENDING', dot: 'bg-red-500', cls: 'bg-red-500/10     text-red-400     border-red-500/20' },
    'in-progress': { label: 'IN PROGRESS', dot: 'bg-amber-400', cls: 'bg-amber-500/10  text-amber-400   border-amber-500/20' },
    resolved: { label: 'RESOLVED', dot: 'bg-emerald-400', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };

  const { label, dot, cls } = config[status] || {
    label: status?.toUpperCase() || 'UNKNOWN',
    dot: 'bg-slate-400',
    cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-[3px] text-[10px] font-semibold tracking-widest border mono ${cls}`}>
      <span className={`w-1.5 h-1.5 rotate-45 inline-block flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
