export default function StatusBadge({ status }) {
  const config = {
    pending:     { label: 'Pending',     cls: 'bg-red-100 text-red-700 border border-red-200' },
    'in-progress': { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    resolved:    { label: 'Resolved',    cls: 'bg-green-100 text-green-700 border border-green-200' },
  };

  const { label, cls } = config[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'resolved' ? 'bg-green-500' :
        status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      {label}
    </span>
  );
}
