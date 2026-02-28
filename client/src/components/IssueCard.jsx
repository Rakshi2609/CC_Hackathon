import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ShieldCheck, Flame, MapPin, ThumbsUp, Building2 } from 'lucide-react';

const CATEGORY_ICON = {
  Pothole: 'M', Streetlight: 'E', Garbage: 'W', Drainage: 'D', 'Water Leakage': 'H', Others: 'G',
};
const CATEGORY_COLOR = {
  Pothole: 'text-red-400 bg-red-500/10 border-red-500/20',
  Streetlight: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Garbage: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
  Drainage: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Water Leakage': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Others: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
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
      className="fade-in block glass rounded-[6px] overflow-hidden hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-150 group"
    >
      {/* Image or category banner */}
      {(issue.imageUrl || issue.photoUrl) ? (
        <div className="relative h-36 overflow-hidden">
          <img
            src={`http://localhost:5000${issue.imageUrl || issue.photoUrl}`}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <StatusBadge status={issue.status} />
          </div>
          {issue.aiVerified && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 border border-emerald-500/30">
              <ShieldCheck size={10} className="text-emerald-400" />
              <span className="mono text-[9px] text-emerald-400 tracking-wider">AI_VFD</span>
            </div>
          )}
        </div>
      ) : (
        <div className={`h-36 flex items-center justify-center border-b border-white/[0.06] ${catColor.split(' ')[1]}`}>
          <div className={`w-12 h-12 rounded-[4px] border flex items-center justify-center ${catColor}`}>
            <span className="mono text-sm font-bold">{catShort}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Cluster badge */}
        {isClusterPrimary && (
          <div className="mb-2.5 flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20">
            <Flame size={10} className="text-amber-400" />
            <span className="mono text-[9px] text-amber-400 tracking-wider font-semibold">
              HOTSPOT Â· {memberCount + 1} REPORTS
            </span>
          </div>
        )}
        {isClusterMember && !isClusterPrimary && (
          <div className="mb-2.5 flex items-center gap-1 px-2 py-1 rounded-[3px] bg-amber-500/5 border border-amber-500/15">
            <span className="mono text-[9px] text-amber-600 tracking-wider">CLUSTER_MEMBER</span>
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
          <h3 className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {issue.title}
          </h3>
          {issue.aiVerified && !(issue.imageUrl || issue.photoUrl) && (
            <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Category + date */}
        <div className="flex items-center justify-between mb-3">
          <span className={`mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${catColor}`}>
            {issue.category?.toUpperCase() || 'UNCATEGORIZED'}
          </span>
          <span className="mono text-[10px] text-slate-700">{date}</span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
          <span className="flex items-center gap-1 mono text-[10px] text-slate-700">
            <MapPin size={9} />
            {issue.location?.address
              ? issue.location.address.substring(0, 22) + (issue.location.address.length > 22 ? 'â€¦' : '')
              : `${Number(issue.location?.coordinates?.[1]).toFixed(3)}, ${Number(issue.location?.coordinates?.[0]).toFixed(3)}`}
          </span>
          {govView && issue.citizen ? (
            <span className="mono text-[10px] text-blue-500">{issue.citizen.name}</span>
          ) : (
            <span className="flex items-center gap-1 mono text-[10px] text-slate-600">
              <ThumbsUp size={9} /> {issue.upvotes || 0}
            </span>
          )}
        </div>

        {issue.assignedDepartment && (
          <div className="mt-2 flex items-center gap-1 pt-2 border-t border-white/[0.04]">
            <Building2 size={9} className="text-slate-700" />
            <span className="mono text-[10px] text-slate-700">{issue.assignedDepartment}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
