export default function StatusBadge({ status }) {
  const config = {
    pending: { label: 'PENDING', cls: 'bg-red-100    text-red-700    border border-red-200' },
    'in-progress': { label: 'IN PROGRESS', cls: 'bg-amber-100  text-amber-700  border border-amber-200' },
    resolved: { label: 'RESOLVED', cls: 'bg-green-100  text-green-800  border border-green-200' },
  };

  const { label, cls } = config[status] || {
    label: status?.toUpperCase() || 'UNKNOWN',
    cls: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded-sm text-[10px] font-semibold tracking-widest mono ${cls}`}>
      {label}
    </span>
  );
}
