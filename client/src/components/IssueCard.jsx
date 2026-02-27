import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS = {
  Pothole: '🕳️',
  Streetlight: '💡',
  Garbage: '🗑️',
  Drainage: '🌊',
  'Water Leakage': '💧',
  Others: '📌',
};

export default function IssueCard({ issue, govView = false }) {
  const icon = CATEGORY_ICONS[issue.category] || '📌';
  const date = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Cluster: primary has isCluster=true, member has clusterId set
  const isClusterPrimary = issue.isCluster;
  const isClusterMember = !!issue.clusterId;
  const memberCount = issue.clusterMembers?.length || 0;

  return (
    <Link
      to={`/issues/${issue._id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* Image */}
      {issue.imageUrl ? (
        <img
          src={`http://localhost:5000${issue.imageUrl}`}
          alt={issue.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-5xl">
          {icon}
        </div>
      )}

      <div className="p-4">
        {/* Cluster banner */}
        {isClusterPrimary && (
          <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700">
            🔥 {memberCount + 1} people reported this issue nearby
          </div>
        )}
        {isClusterMember && !isClusterPrimary && (
          <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl text-xs font-semibold text-yellow-700">
            📍 Part of a nearby cluster
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{issue.title}</h3>
          <StatusBadge status={issue.status} />
        </div>

        {/* Category + date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <span>{icon}</span> {issue.category}
          </span>
          <span>{date}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{issue.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            📍 {issue.location?.address || `${issue.location?.coordinates?.[1]?.toFixed(4)}, ${issue.location?.coordinates?.[0]?.toFixed(4)}`}
          </span>
          {govView && issue.citizen && (
            <span className="text-green-600 font-medium">{issue.citizen.name}</span>
          )}
          {!govView && (
            <span className="flex items-center gap-1">
              👍 {issue.upvotes || 0}
            </span>
          )}
        </div>

        {/* Department */}
        {issue.assignedDepartment && (
          <div className="mt-2 pt-2 border-t border-gray-50">
            <span className="text-xs text-green-600 font-medium">
              🏢 {issue.assignedDepartment}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
