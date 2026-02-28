import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ShieldCheck, Flame, MapPin, ThumbsUp, Building2 } from 'lucide-react';

const CATEGORY_ICON = {
  Pothole: 'M', Streetlight: 'E', Garbage: 'W', Drainage: 'D', 'Water Leakage': 'H', Others: 'G',
};
const CATEGORY_COLOR = {
  Pothole: 'text-red-700    bg-red-50    border-red-200',
  Streetlight: 'text-amber-700  bg-amber-50  border-amber-200',
  Garbage: 'text-orange-700 bg-orange-50 border-orange-200',
  Drainage: 'text-blue-700   bg-blue-50   border-blue-200',
  'Water Leakage': 'text-cyan-700   bg-cyan-50   border-cyan-200',
  Others: 'text-gray-600   bg-gray-100  border-gray-200',
};

export default function IssueCard({ issue, govView = false }) {
  const date = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const isClusterPrimary = issue.isCluster;
  const isClusterMember = !!issue.clusterId;
  const memberCount = issue.clusterMembers?.length || 0;
  const catColor = CATEGORY_COLOR[issue.category] || CATEGORY_COLOR.Others;
  const catShort = issue.category?.substring(0, 2).toUpperCase() || 'XX';

  return (
    <Link
      to={`/issues/${issue._id}`}
      className="fade-in block bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-blue-400 hover:shadow-sm transition-all duration-150 group"
    >
      {/* Image or category banner */}
      {(issue.imageUrl || issue.photoUrl) ? (
        <div className="relative h-36 overflow-hidden">
          <img
            src={`http://localhost:5000${issue.imageUrl || issue.photoUrl}`}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <StatusBadge status={issue.status} />
          </div>
          {issue.aiVerified && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-green-50 border border-green-200">
              <ShieldCheck size={10} className="text-green-700" />
              <span className="mono text-[9px] text-green-700 tracking-wider">AI VFD</span>
            </div>
          )}
        </div>
      ) : (
        <div className={`h-36 flex items-center justify-center border-b border-gray-100 ${catColor.split(' ')[1]}`}>
          <div className={`w-12 h-12 rounded-[4px] border flex items-center justify-center ${catColor}`}>
            <span className="mono text-sm font-bold">{catShort}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Cluster badge */}
        {isClusterPrimary && (
          <div className="mb-2.5 flex items-center gap-1.5 px-2 py-1 rounded-sm bg-amber-50 border border-amber-200">
            <Flame size={10} className="text-amber-600" />
            <span className="mono text-[9px] text-amber-700 tracking-wider font-semibold">
              HOTSPOT · {memberCount + 1} REPORTS
            </span>
          </div>
        )}
        {isClusterMember && !isClusterPrimary && (
          <div className="mb-2.5 flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-50 border border-amber-100">
            <span className="mono text-[9px] text-amber-600 tracking-wider">CLUSTER MEMBER</span>
          </div>
        )}

        {/* Status if no image */}
        {!(issue.imageUrl || issue.photoUrl) && (
          <div className="mb-2">
            <StatusBadge status={issue.status} />
          </div>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {issue.title}
          </h3>
          {issue.aiVerified && !(issue.imageUrl || issue.photoUrl) && (
            <ShieldCheck size={13} className="text-green-600 flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Category + date */}
        <div className="flex items-center justify-between mb-3">
          <span className={`mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${catColor}`}>
            {issue.category?.toUpperCase() || 'UNCATEGORIZED'}
          </span>
          <span className="mono text-[10px] text-gray-400">{date}</span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
          <span className="flex items-center gap-1 mono text-[10px] text-gray-500">
            <MapPin size={9} />
            {issue.location?.address
              ? issue.location.address.substring(0, 22) + (issue.location.address.length > 22 ? 'â€¦' : '')
              : `${Number(issue.location?.coordinates?.[1]).toFixed(3)}, ${Number(issue.location?.coordinates?.[0]).toFixed(3)}`}
          </span>
          {govView && issue.citizen ? (
            <span className="mono text-[10px] text-blue-500">{issue.citizen.name}</span>
          ) : (
            <span className="flex items-center gap-1 mono text-[10px] text-gray-500">
              <ThumbsUp size={9} /> {issue.upvotes || 0}
            </span>
          )}
        </div>

        {issue.assignedDepartment && (
          <div className="mt-2 flex items-center gap-1 pt-2 border-t border-gray-100">
            <Building2 size={9} className="text-gray-400" />
            <span className="mono text-[10px] text-gray-400">{issue.assignedDepartment}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
