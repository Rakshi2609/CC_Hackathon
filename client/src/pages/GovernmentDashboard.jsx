import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import IotAlertBanner from '../components/IotAlertBanner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Flame, ChevronRight, ChevronLeft, TrendingUp, CheckCircle2,
  AlertCircle, Clock, BarChart3, RefreshCw, Layers,
  LayoutDashboard, FileText, Map, LogOut, Shield,
  Filter, Users, Target, Activity, ShieldCheck, ShieldAlert, ArrowUpDown,
} from 'lucide-react';

/* ── Category dot colours ─────────────────────────── */
const CAT_DOT = {
  Pothole: 'bg-red-500',
  Streetlight: 'bg-amber-400',
  Garbage: 'bg-orange-500',
  Drainage: 'bg-blue-500',
  'Water Leakage': 'bg-cyan-500',
  Others: 'bg-gray-400',
};

/* ── Stat card ────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, sub, borderColor, iconClass }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-sm p-4 flex items-center gap-3 fade-in border-l-4 ${borderColor}`}>
      <div className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 bg-gray-50 ${iconClass}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="mono text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="mono text-[10px] text-gray-400 tracking-widest mt-1 uppercase">{label}</div>
        {sub != null && <div className="mono text-[10px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Sidebar nav item ─────────────────────────────── */
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors text-left ${active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

/* ── Reports table (reused by Overview + Reports) ─ */
function ReportsTable({ issues, title, total, statusFilter, catFilter, CATS, onStatusFilter, onCatFilter, sortOrder, onSortOrder, page, totalPages, onPage, navigate, showFilters, viewAllLabel, onViewAll }) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers size={12} className="text-gray-400" />
          <span className="mono text-[9px] text-gray-500 tracking-widest uppercase">{title}</span>
          <span className="mono text-[9px] text-gray-400">({total})</span>
        </div>
        {showFilters && (
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-gray-400"><Filter size={11} /></div>
            <select value={statusFilter} onChange={e => onStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-sm mono text-[10px] text-gray-600 tracking-wide">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={catFilter} onChange={e => onCatFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-sm mono text-[10px] text-gray-600 tracking-wide">
              <option value="">All Categories</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Sort order */}
            <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
              <ArrowUpDown size={10} className="text-gray-400" />
              <select value={sortOrder} onChange={e => onSortOrder(e.target.value)}
                className="px-2.5 py-1.5 rounded-sm mono text-[10px] text-gray-600 tracking-wide">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="severity_desc">Severity ↓</option>
                <option value="severity_asc">Severity ↑</option>
              </select>
            </div>
          </div>
        )}
        {viewAllLabel && (
          <button onClick={onViewAll} className="ml-auto mono text-[10px] text-blue-600 hover:text-blue-800 transition-colors">
            {viewAllLabel}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['#', 'Title', 'Category', 'Status', 'Severity', 'AI', 'Citizen'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left mono text-[9px] text-gray-400 tracking-widest font-semibold uppercase">{h}</th>
              ))}
              <th
                onClick={() => showFilters && onSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className={`px-4 py-2.5 text-left mono text-[9px] tracking-widest font-semibold uppercase select-none ${showFilters ? 'cursor-pointer hover:text-blue-600 text-gray-400' : 'text-gray-400'}`}
              >
                Reported {showFilters && (sortOrder === 'newest' ? '↓' : sortOrder === 'oldest' ? '↑' : '')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((issue, i) => {
              const sev = issue.severityScore ?? 0;
              const sevColor = sev >= 70 ? 'text-red-600' : sev >= 50 ? 'text-amber-600' : 'text-green-600';
              const sevBar   = sev >= 70 ? 'bg-red-500'  : sev >= 50 ? 'bg-amber-400'  : 'bg-green-500';
              return (
                <tr key={issue._id} onClick={() => navigate(`/issues/${issue._id}`)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 mono text-[10px] text-gray-400">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3"><p className="text-xs text-gray-800 font-medium line-clamp-1 max-w-[200px]">{issue.title}</p></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 mono text-[9px] text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${CAT_DOT[issue.category] || 'bg-gray-400'}`} />
                      {issue.category}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 min-w-[80px]">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                        <div className={`h-full rounded-full ${sevBar}`} style={{ width: `${sev}%` }} />
                      </div>
                      <span className={`mono text-[10px] font-semibold ${sevColor}`}>{sev}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {issue.aiVerified
                      ? <ShieldCheck size={13} className="text-green-600" title="AI Verified" />
                      : <ShieldAlert size={13} className="text-gray-300" title="Unverified" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{issue.citizen?.name || '—'}</td>
                  <td className="px-4 py-3 mono text-[10px] text-gray-400">{new Date(issue.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              );
            })}
            {issues.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center mono text-[11px] text-gray-400">NO RECORDS FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showFilters && totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="mono text-[10px] text-gray-400">
            Page {page} of {totalPages} · {total} records
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={13} className="text-gray-500" />
            </button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const pg = i + 1;
              return (
                <button key={pg} onClick={() => onPage(pg)}
                  className={`mono w-7 h-7 rounded-sm text-[11px] font-medium transition-colors border ${page === pg ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}>
                  {pg}
                </button>
              );
            })}
            {totalPages > 7 && <span className="mono text-[11px] text-gray-400 px-1">…</span>}
            <button onClick={() => onPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={13} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, categoryStats: [] });
  const [mapIssues, setMapIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [reportPage, setReportPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');
  const [now, setNow] = useState(new Date());

  const ITEMS_PER_PAGE = 15;
  const CATS = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [cl, map, st, al] = await Promise.all([
        api.get('/issues/clusters'),
        api.get('/issues/map'),
        api.get('/issues/stats'),
        api.get('/issues?limit=200'),
      ]);
      setClusters(cl.data.clusters || []);
      setMapIssues(map.data || []);
      setStats({
        total: st.data.total || 0,
        pending: st.data.pending || 0,
        inProgress: st.data.inProgress || 0,
        resolved: st.data.resolved || 0,
        categoryStats: st.data.categoryStats || [],
      });
      setAllIssues(al.data.issues || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Reset page when filters/sort change
  useEffect(() => { setReportPage(1); }, [statusFilter, catFilter, sortOrder]);

  const sortedClusters = [...clusters].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  const filteredIssues = allIssues
    .filter(i =>
      (!statusFilter || i.status === statusFilter) &&
      (!catFilter || i.category === catFilter)
    )
    .sort((a, b) => {
      if (sortOrder === 'newest')        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'oldest')        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'severity_desc') return (b.severityScore || 0) - (a.severityScore || 0);
      if (sortOrder === 'severity_asc')  return (a.severityScore || 0) - (b.severityScore || 0);
      return 0;
    });
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE));
  const pagedIssues = filteredIssues.slice((reportPage - 1) * ITEMS_PER_PAGE, reportPage * ITEMS_PER_PAGE);
  const resolutionRate = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const topUpvoted = [...allIssues].sort((a, b) => (b.severityScore || 0) - (a.severityScore || 0)).slice(0, 5);
  const recentResolved = allIssues.filter(i => i.status === 'resolved').slice(0, 5);
  const aiVerifiedCount = allIssues.filter(i => i.aiVerified).length;
  const aiUnverifiedCount = allIssues.length - aiVerifiedCount;

  const NAV_LABELS = { overview: 'Overview', reports: 'All Reports', map: 'Map View', analytics: 'Analytics' };

  /* ── Overview ─────────────────────────────────── */
  const OverviewView = (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={BarChart3} value={stats.total} label="Total Reports" sub={`${sortedClusters.length} hotspots`} borderColor="border-l-gray-400" iconClass="text-gray-500" />
        <StatCard icon={AlertCircle} value={stats.pending} label="Pending" sub="awaiting action" borderColor="border-l-red-500" iconClass="text-red-600" />
        <StatCard icon={Clock} value={stats.inProgress} label="In Progress" sub="being resolved" borderColor="border-l-amber-400" iconClass="text-amber-600" />
        <StatCard icon={CheckCircle2} value={stats.resolved} label="Resolved" sub={`${resolutionRate}% resolution rate`} borderColor="border-l-green-600" iconClass="text-green-700" />
      </div>

      {/* War room: queue + map */}
      <div className="flex gap-4" style={{ height: '56vh', minHeight: 460 }}>
        {/* Priority queue + category */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          {/* Category breakdown */}
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <p className="mono text-[9px] text-gray-400 tracking-widest mb-3 uppercase">Category Breakdown</p>
            <div className="space-y-2">
              {stats.categoryStats.slice(0, 6).map(cs => (
                <div key={cs._id} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_DOT[cs._id] || 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-700 flex-1 truncate">{cs._id}</span>
                  <span className="mono text-[10px] text-gray-400">{cs.count}</span>
                  <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${CAT_DOT[cs._id] || 'bg-gray-400'}`}
                      style={{ width: `${Math.round((cs.count / (stats.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {stats.categoryStats.length === 0 && <p className="mono text-[11px] text-gray-400">NO DATA</p>}
            </div>
          </div>

          {/* Priority queue */}
          <div className="bg-white border border-gray-200 rounded-sm flex flex-col overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
              <TrendingUp size={12} className="text-amber-500" />
              <span className="mono text-[9px] text-gray-500 tracking-widest uppercase">Priority Queue</span>
              <span className="ml-auto mono text-[9px] text-gray-400">{sortedClusters.length} clusters</span>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {sortedClusters.slice(0, 20).map((cluster, idx) => {
                const urgent = (cluster.priorityScore || 0) > 5;
                const count = (cluster.clusterMembers?.length || 0) + 1;
                return (
                  <li key={cluster._id} onClick={() => navigate(`/issues/${cluster._id}`)}
                    className={`px-4 py-3 cursor-pointer transition-colors fade-in group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 ${urgent ? 'border-l-2 border-l-amber-400' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-700">{cluster.title}</p>
                      <ChevronRight size={11} className="text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="mono text-[9px] text-gray-400">#{String(idx + 1).padStart(2, '0')}</span>
                      <span className="mono text-[9px] text-gray-400">{cluster.category}</span>
                      {urgent && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-amber-50 border border-amber-200 mono text-[8px] text-amber-700 font-semibold tracking-wider">
                          <Flame size={7} /> URGENT
                        </span>
                      )}
                      <span className="ml-auto mono text-[9px] text-gray-400">{count} rpt</span>
                    </div>
                  </li>
                );
              })}
              {sortedClusters.length === 0 && (
                <div className="flex items-center justify-center h-24">
                  <p className="mono text-[11px] text-gray-400">NO HOTSPOTS DETECTED</p>
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
          <IssueMap issues={mapIssues} title="LIVE CIVIC INTELLIGENCE MAP" />
        </div>
      </div>

      {/* Recent issues preview */}
      <ReportsTable
        issues={allIssues.slice(0, 10)}
        title="Recent Reports"
        total={allIssues.length}
        statusFilter="" catFilter="" CATS={CATS}
        onStatusFilter={() => { }} onCatFilter={() => { }}
        sortOrder="newest" onSortOrder={() => { }}
        page={1} totalPages={1} onPage={() => { }}
        navigate={navigate}
        showFilters={false}
        viewAllLabel="View All Reports →"
        onViewAll={() => setActiveNav('reports')}
      />
    </>
  );

  /* ── Reports ──────────────────────────────────── */
  const ReportsView = (
    <ReportsTable
      issues={pagedIssues}
      title="All Reports"
      total={filteredIssues.length}
      statusFilter={statusFilter} catFilter={catFilter} CATS={CATS}
      onStatusFilter={setStatusFilter} onCatFilter={setCatFilter}
      sortOrder={sortOrder} onSortOrder={setSortOrder}
      page={reportPage} totalPages={totalPages} onPage={setReportPage}
      navigate={navigate}
      showFilters={true}
    />
  );

  /* ── Map View ─────────────────────────────────── */
  const MapView = (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 120px)' }}>
      <IssueMap issues={mapIssues} title="FULL CITY ISSUE MAP" />
    </div>
  );

  /* ── Analytics ────────────────────────────────── */
  const AnalyticsView = (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={Target} value={`${resolutionRate}%`} label="Resolution Rate" sub={`${stats.resolved} of ${stats.total} resolved`} borderColor="border-l-green-600" iconClass="text-green-700" />
        <StatCard icon={Activity} value={stats.inProgress} label="Active Work" sub="currently in-progress" borderColor="border-l-amber-400" iconClass="text-amber-600" />
        <StatCard icon={Users} value={sortedClusters.length} label="Hotspot Clusters" sub="geo-clustered zones" borderColor="border-l-blue-500" iconClass="text-blue-600" />
        <StatCard icon={ShieldCheck} value={aiVerifiedCount} label="AI Verified" sub={`${aiUnverifiedCount} unverified`} borderColor="border-l-purple-500" iconClass="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Category bar chart */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Issues by Category</span>
            <span className="ml-auto mono text-[10px] text-gray-400">{stats.total} total</span>
          </div>
          <div className="space-y-3">
            {(stats.categoryStats.length > 0 ? stats.categoryStats : CATS.map(c => ({ _id: c, count: 0 }))).map(cs => {
              const pct = stats.total ? Math.round((cs.count / stats.total) * 100) : 0;
              return (
                <div key={cs._id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${CAT_DOT[cs._id] || 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-700 font-medium">{cs._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="mono text-[10px] text-gray-500">{cs.count} issues</span>
                      <span className="mono text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${CAT_DOT[cs._id] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Status Distribution</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Pending', value: stats.pending, pct: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0, color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
              { label: 'In Progress', value: stats.inProgress, pct: stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0, color: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-400' },
              { label: 'Resolved', value: stats.resolved, pct: stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0, color: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-600' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border border-gray-200 rounded-sm p-4 text-center`}>
                <p className={`mono text-3xl font-bold ${s.color} leading-none`}>{s.pct}%</p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">{s.label}</p>
                <p className="mono text-[10px] text-gray-400">{s.value} issues</p>
              </div>
            ))}
          </div>
          {/* Stacked bar */}
          <p className="mono text-[9px] text-gray-400 tracking-widest mb-2 uppercase">Overall Progress</p>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {stats.total > 0 && <>
              <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${Math.round((stats.pending / stats.total) * 100)}%` }} title="Pending" />
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${Math.round((stats.inProgress / stats.total) * 100)}%` }} title="In Progress" />
              <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${Math.round((stats.resolved / stats.total) * 100)}%` }} title="Resolved" />
            </>}
          </div>
          <div className="flex gap-4 mt-2">
            {[['bg-red-500', 'Pending'], ['bg-amber-400', 'In Progress'], ['bg-green-600', 'Resolved']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 mono text-[9px] text-gray-400">
                <span className={`w-2 h-2 rounded-full ${c}`} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Hotspot leaderboard */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={14} className="text-amber-500" />
            <span className="text-sm font-semibold text-gray-900">Top Hotspot Clusters</span>
            <span className="ml-auto mono text-[10px] text-gray-400">{sortedClusters.length} total</span>
          </div>
          {sortedClusters.length === 0 ? (
            <p className="mono text-[11px] text-gray-400 py-6 text-center">NO HOTSPOT DATA</p>
          ) : (
            <div className="space-y-2">
              {sortedClusters.slice(0, 6).map((c, i) => {
                const count = (c.clusterMembers?.length || 0) + 1;
                const score = c.priorityScore || 0;
                const maxScore = sortedClusters[0]?.priorityScore || 1;
                return (
                  <div key={c._id} onClick={() => navigate(`/issues/${c._id}`)}
                    className="flex items-center gap-3 py-2 px-3 rounded-sm hover:bg-gray-50 cursor-pointer group border border-transparent hover:border-gray-200 transition-all">
                    <span className={`mono text-[10px] font-bold w-5 text-center flex-shrink-0 ${i === 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="mono text-[9px] text-gray-400">{c.category}</span>
                        <span className="mono text-[9px] text-gray-400">{count} reports</span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <div className="w-20 flex flex-col items-end gap-1">
                      <span className="mono text-[9px] text-gray-500 font-semibold">Score: {score.toFixed(1)}</span>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round((score / maxScore) * 100)}%` }} />
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Most high-severity issues */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-red-500" />
            <span className="text-sm font-semibold text-gray-900">Highest Severity Issues</span>
            <span className="ml-auto mono text-[10px] text-gray-400">by AI score</span>
          </div>
          {topUpvoted.length === 0 ? (
            <p className="mono text-[11px] text-gray-400 py-6 text-center">NO DATA</p>
          ) : (
            <div className="space-y-2">
              {topUpvoted.map((issue, i) => {
                const sev = issue.severityScore ?? 0;
                const sevColor = sev >= 70 ? 'text-red-600' : sev >= 50 ? 'text-amber-600' : 'text-green-600';
                const sevBar   = sev >= 70 ? 'bg-red-500'  : sev >= 50 ? 'bg-amber-400'  : 'bg-green-500';
                return (
                  <div key={issue._id} onClick={() => navigate(`/issues/${issue._id}`)}
                    className="flex items-center gap-3 py-2 px-3 rounded-sm hover:bg-gray-50 cursor-pointer group border border-transparent hover:border-gray-200 transition-all">
                    <span className={`mono text-[10px] font-bold w-5 text-center flex-shrink-0 ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[issue.category] || 'bg-gray-400'}`} />
                        <span className="mono text-[9px] text-gray-400">{issue.category}</span>
                        <StatusBadge status={issue.status} />
                        {issue.aiVerified && <ShieldCheck size={9} className="text-green-500" />}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[60px]">
                      <span className={`mono text-[10px] font-bold ${sevColor}`}>{sev}%</span>
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sevBar}`} style={{ width: `${sev}%` }} />
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* AI Verification stats */}
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-900">AI Classification</span>
            <span className="ml-auto mono text-[10px] text-gray-400">{allIssues.length} total</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-sm p-4 text-center">
              <p className="mono text-3xl font-bold text-green-700 leading-none">{aiVerifiedCount}</p>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">AI Verified</p>
              <p className="mono text-[10px] text-gray-400">{allIssues.length ? Math.round((aiVerifiedCount / allIssues.length) * 100) : 0}%</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 text-center">
              <p className="mono text-3xl font-bold text-gray-500 leading-none">{aiUnverifiedCount}</p>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Unverified</p>
              <p className="mono text-[10px] text-gray-400">{allIssues.length ? Math.round((aiUnverifiedCount / allIssues.length) * 100) : 0}%</p>
            </div>
          </div>
          <p className="mono text-[9px] text-gray-400 tracking-widest mb-2 uppercase">Severity Distribution</p>
          {[['HIGH (≥70%)', allIssues.filter(i => (i.severityScore ?? 0) >= 70).length, 'bg-red-500', 'text-red-600'],
            ['MEDIUM (50-69%)', allIssues.filter(i => { const s = i.severityScore ?? 0; return s >= 50 && s < 70; }).length, 'bg-amber-400', 'text-amber-700'],
            ['LOW (<50%)', allIssues.filter(i => (i.severityScore ?? 0) < 50).length, 'bg-green-500', 'text-green-700'],
          ].map(([label, count, bar, text]) => (
            <div key={label} className="flex items-center gap-2 mb-2">
              <span className={`mono text-[9px] w-28 flex-shrink-0 ${text}`}>{label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${bar}`}
                  style={{ width: `${allIssues.length ? Math.round((count / allIssues.length) * 100) : 0}%` }} />
              </div>
              <span className="mono text-[10px] text-gray-400 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently resolved */}
      <div className="bg-white border border-gray-200 rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Recently Resolved</span>
          <span className="ml-auto mono text-[10px] text-gray-400">{stats.resolved} total resolved</span>
        </div>
        {recentResolved.length === 0 ? (
          <p className="mono text-[11px] text-gray-400 py-4 text-center">NO RESOLVED ISSUES YET</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentResolved.map(issue => (
              <div key={issue._id} onClick={() => navigate(`/issues/${issue._id}`)}
                className="flex items-center gap-4 py-3 hover:bg-gray-50 cursor-pointer group px-2 rounded-sm transition-colors">
                <div className="w-6 h-6 rounded-sm bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={12} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700">{issue.title}</p>
                  <p className="mono text-[9px] text-gray-400 mt-0.5">{issue.category} · {issue.citizen?.name || '—'}</p>
                </div>
                <span className="mono text-[9px] text-gray-400 flex-shrink-0">
                  {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                </span>
                <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const views = { overview: OverviewView, reports: ReportsView, map: MapView, analytics: AnalyticsView };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Fixed left sidebar ──────────────────────── */}
      <aside className="w-56 flex-shrink-0 h-screen flex flex-col bg-gray-50 border-r border-gray-200">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">CivicPlus</p>
            <p className="mono text-[9px] text-gray-400 tracking-widest mt-0.5">GOV PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="mono text-[9px] text-gray-400 tracking-widest px-3 pb-2 uppercase">Navigation</p>
          <NavItem icon={LayoutDashboard} label="Overview" active={activeNav === 'overview'} onClick={() => setActiveNav('overview')} />
          <NavItem icon={FileText} label="Reports" active={activeNav === 'reports'} onClick={() => setActiveNav('reports')} />
          <NavItem icon={Map} label="Map View" active={activeNav === 'map'} onClick={() => setActiveNav('map')} />
          <NavItem icon={TrendingUp} label="Analytics" active={activeNav === 'analytics'} onClick={() => setActiveNav('analytics')} />
        </nav>

        {/* Sidebar stats summary */}
        <div className="px-4 py-3 border-t border-gray-200 space-y-1.5">
          <p className="mono text-[9px] text-gray-400 tracking-widest uppercase mb-2">At a Glance</p>
          {[
            { label: 'Total', val: stats.total, dot: 'bg-gray-400' },
            { label: 'Pending', val: stats.pending, dot: 'bg-red-500' },
            { label: 'In Progress', val: stats.inProgress, dot: 'bg-amber-400' },
            { label: 'Resolved', val: stats.resolved, dot: 'bg-green-600' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
              </span>
              <span className="mono text-[11px] font-semibold text-gray-800">{s.val}</span>
            </div>
          ))}
        </div>

        <div className="px-3 py-3 border-t border-gray-200 space-y-1">
          {user && (
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm bg-blue-100 flex items-center justify-center">
                <Shield size={11} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
                <p className="mono text-[9px] text-gray-400 tracking-wide uppercase">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout?.(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mono mb-0.5">
              <span>Command Center</span>
              <ChevronRight size={10} />
              <span className="text-gray-700 font-semibold">{NAV_LABELS[activeNav]}</span>
            </div>
            <p className="mono text-[10px] text-gray-400 tracking-widest">
              {now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              &nbsp;·&nbsp;
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <IotAlertBanner />
            <button
              onClick={fetchAll} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-sm mono text-[10px] text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {refreshing && allIssues.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-sm h-24" />)}
            </div>
          ) : (
            views[activeNav]
          )}
        </main>
      </div>
    </div>
  );
}


