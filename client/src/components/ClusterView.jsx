import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS = {
  Pothole: '🕳️',
  Streetlight: '💡',
  Garbage: '🗑️',
  Drainage: '🌊',
  'Water Leakage': '💧',
  Others: '📌',
};

export default function ClusterView() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClusters();
  }, [page]);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/clusters?page=${page}&limit=10`);
      setClusters(res.data.clusters);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {/* ignore */}
    finally { setLoading(false); }
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (clusters.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">🎯</p>
        <h3 className="font-semibold text-gray-700 text-lg">No clusters detected yet</h3>
        <p className="text-gray-400 text-sm mt-1">
          Clusters form when 2+ citizens report the same category issue within 100 m.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {total} active hotspot{total !== 1 ? 's' : ''} — each cluster aggregates reports within 100 m of each other.
      </p>

      {clusters.map((cluster) => {
        const allReporters = [cluster, ...cluster.clusterMembers];
        const icon = CATEGORY_ICONS[cluster.category] || '📌';
        const isOpen = expanded[cluster._id];

        return (
          <div
            key={cluster._id}
            className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden"
          >
            {/* Cluster header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{cluster.title}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-semibold">
                      🔥 {allReporters.length} reporters
                    </span>
                    <StatusBadge status={cluster.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {icon} {cluster.category} ·{' '}
                    {cluster.location?.address ||
                      `${cluster.location?.coordinates?.[1]?.toFixed(4)}, ${cluster.location?.coordinates?.[0]?.toFixed(4)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/issues/${cluster._id}`}
                  className="text-xs text-green-600 hover:underline font-medium"
                >
                  Manage →
                </Link>
                <button
                  onClick={() => toggle(cluster._id)}
                  className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1 rounded-xl border border-gray-200 hover:border-gray-300 transition"
                >
                  {isOpen ? '▲ Collapse' : '▼ All reporters'}
                </button>
              </div>
            </div>

            {/* Reporters list (expanded) */}
            {isOpen && (
              <div className="border-t border-orange-100 px-5 py-4 bg-orange-50/40">
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  All {allReporters.length} Reporters — government view only
                </p>
                <div className="space-y-2">
                  {allReporters.map((reporter, i) => {
                    const citizen = reporter.citizen;
                    const isPrimary = reporter._id === cluster._id;
                    return (
                      <div
                        key={reporter._id || i}
                        className="flex items-center justify-between bg-white rounded-xl border border-orange-100 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {citizen?.name || '—'}
                              {isPrimary && (
                                <span className="ml-1.5 text-xs text-orange-600 font-normal">(primary reporter)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {citizen?.email}
                              {citizen?.phone ? ` · ${citizen.phone}` : ''}
                            </p>
                            {(reporter.title || reporter.description) && (
                              <p className="text-xs text-gray-500 mt-0.5 italic line-clamp-1">
                                "{reporter.description || reporter.title}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <StatusBadge status={reporter.status} />
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(reporter.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <Link
                            to={`/issues/${reporter._id}`}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-orange-600 bg-orange-100 rounded-xl px-3 py-2">
                  ⚡ Updating status on the primary report will automatically update all{' '}
                  {allReporters.length} reports and notify each citizen.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                page === i + 1
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
