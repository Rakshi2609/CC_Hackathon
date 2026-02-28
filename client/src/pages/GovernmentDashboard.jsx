import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import IotAlertBanner from '../components/IotAlertBanner';
import StatusBadge from '../components/StatusBadge';
import {
  Flame, Timer, Activity, ChevronRight, TrendingUp, CheckCircle2,
  AlertCircle, Clock, BarChart3, RefreshCw, Filter, Layers,
} from 'lucide-react';

const CAT_DOT = {
  Pothole: 'bg-red-500', Streetlight: 'bg-amber-400', Garbage: 'bg-orange-500',
  Drainage: 'bg-blue-500', 'Water Leakage': 'bg-cyan-400', Others: 'bg-slate-500',
};

function StatCard({ icon: Icon, value, label, sub, color, border }) {
  return (
    <div className={`glass rounded-[6px] p-4 flex items-center gap-3 fade-in border-t-2 ${border}`}>
      <div className={`w-9 h-9 rounded-[4px] flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="mono text-2xl font-bold text-slate-100 leading-none">{value}</div>
        <div className="mono text-[10px] text-slate-500 tracking-widest mt-1 uppercase">{label}</div>
        {sub != null && <div className="mono text-[10px] text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, categoryStats: [] });
  const [mapIssues, setMapIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [cl, map, st, al] = await Promise.all([
        api.get('/issues/clusters'),
        api.get('/issues/map'),
        api.get('/issues/stats'),
        api.get('/issues?limit=50'),
      ]);
      setClusters(cl.data.clusters || []);
      setMapIssues(map.data || []);
      setStats({ total: st.data.total || 0, pending: st.data.pending || 0, inProgress: st.data.inProgress || 0, resolved: st.data.resolved || 0, categoryStats: st.data.categoryStats || [] });
      setAllIssues(al.data.issues || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const sortedClusters = [...clusters].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  const filteredIssues = allIssues.filter(i =>
    (!statusFilter || i.status === statusFilter) &&
    (!catFilter || i.category === catFilter)
  );

  const CATS = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06]" style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1600px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 blink" />
            <div>
              <h1 className="text-sm font-semibold text-slate-100 tracking-tight">Command Center</h1>
              <p className="mono text-[10px] text-slate-600 tracking-widest">
                GOV_DASHBOARD &nbsp;·&nbsp; {now.toLocaleDateString('en-IN')} &nbsp;·&nbsp;
                <span className="mono text-[10px] text-slate-500">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IotAlertBanner />
            <button
              onClick={fetchAll}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-[4px] mono text-[10px] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-5 pt-5 pb-10 flex flex-col gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={BarChart3}    value={stats.total}      label="Total Reports"   sub={`${sortedClusters.length} hotspots`} color="bg-slate-500/10 text-slate-400"  border="border-slate-500/30" />
          <StatCard icon={AlertCircle}  value={stats.pending}    label="Pending"         sub="awaiting action"                     color="bg-red-500/10 text-red-400"     border="border-red-500/40" />
          <StatCard icon={Clock}        value={stats.inProgress} label="In Progress"     sub="being resolved"                      color="bg-amber-500/10 text-amber-400" border="border-amber-500/40" />
          <StatCard icon={CheckCircle2} value={stats.resolved}   label="Resolved"        sub={stats.total ? `${Math.round((stats.resolved/stats.total)*100)}% rate` : '—'} color="bg-emerald-500/10 text-emerald-400" border="border-emerald-500/40" />
        </div>

        {/* Main body */}
        <div className="flex gap-4" style={{ height: '60vh', minHeight: 480 }}>

          {/* Left sidebar */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">

            {/* Category breakdown */}
            <div className="glass rounded-[6px] p-4">
              <p className="mono text-[10px] text-slate-600 tracking-widest mb-3">CATEGORY_BREAKDOWN</p>
              <div className="space-y-2">
                {stats.categoryStats.slice(0, 5).map(cs => (
                  <div key={cs._id} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CAT_DOT[cs._id] || 'bg-slate-500'}`} />
                    <span className="text-[12px] text-slate-300 flex-1 truncate">{cs._id}</span>
                    <span className="mono text-[10px] text-slate-500">{cs.count}</span>
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CAT_DOT[cs._id] || 'bg-slate-500'}`}
                        style={{ width: `${Math.round((cs.count / (stats.total || 1)) * 100)}%`, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                ))}
                {stats.categoryStats.length === 0 && <p className="mono text-[11px] text-slate-700">NO_DATA</p>}
              </div>
            </div>

            {/* Priority queue */}
            <div className="glass rounded-[6px] flex flex-col overflow-hidden flex-1">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2 flex-shrink-0">
                <TrendingUp size={12} className="text-amber-400" />
                <span className="mono text-[10px] text-slate-400 tracking-widest">PRIORITY_QUEUE</span>
                <span className="ml-auto mono text-[10px] text-slate-700">{sortedClusters.length} clusters</span>
              </div>
              <ul className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                {sortedClusters.slice(0, 15).map((cluster, idx) => {
                  const urgent = (cluster.priorityScore || 0) > 5;
                  const count = (cluster.clusterMembers?.length || 0) + 1;
                  return (
                    <li
                      key={cluster._id}
                      onClick={() => navigate(`/issues/${cluster._id}`)}
                      className={`px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors fade-in ${
                        urgent ? 'border-l-2 border-amber-500' : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-[12px] font-medium text-slate-200 leading-snug line-clamp-2">{cluster.title}</p>
                        <ChevronRight size={11} className="text-slate-700 flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="mono text-[9px] text-slate-600">#{String(idx + 1).padStart(2, '0')}</span>
                        <span className="mono text-[9px] text-slate-600">{cluster.category}</span>
                        {urgent && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[2px] bg-amber-500/15 border border-amber-500/25 mono text-[8px] text-amber-400 font-semibold tracking-wider">
                            <Flame size={7} /> URGENT
                          </span>
                        )}
                        <span className="ml-auto mono text-[9px] text-slate-600">{count} rpt</span>
                      </div>
                    </li>
                  );
                })}
                {sortedClusters.length === 0 && (
                  <div className="flex items-center justify-center h-24">
                    <p className="mono text-[11px] text-slate-700">NO_HOTSPOTS_DETECTED</p>
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 glass rounded-[6px] overflow-hidden">
            <IssueMap issues={mapIssues} title="Live Civic Intelligence Map" />
          </div>
        </div>

        {/* Issues table */}
        <div className="glass rounded-[6px] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-slate-500" />
              <span className="mono text-[10px] text-slate-400 tracking-widest">ALL_REPORTS</span>
              <span className="mono text-[10px] text-slate-700">({filteredIssues.length})</span>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-[4px] mono text-[10px] border bg-transparent text-slate-400 tracking-wide"
              >
                <option value="">ALL STATUS</option>
                <option value="pending">PENDING</option>
                <option value="in-progress">IN PROGRESS</option>
                <option value="resolved">RESOLVED</option>
              </select>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-[4px] mono text-[10px] border bg-transparent text-slate-400 tracking-wide"
              >
                <option value="">ALL CATEGORIES</option>
                {CATS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['#', 'TITLE', 'CATEGORY', 'STATUS', 'UPVOTES', 'CITIZEN', 'REPORTED'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left mono text-[9px] text-slate-600 tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredIssues.slice(0, 20).map((issue, i) => (
                  <tr
                    key={issue._id}
                    onClick={() => navigate(`/issues/${issue._id}`)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 mono text-[10px] text-slate-600">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-slate-200 font-medium line-clamp-1 max-w-[240px]">{issue.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 mono text-[9px] px-1.5 py-0.5 rounded-[2px] font-semibold tracking-wider`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[issue.category] || 'bg-slate-500'}`} />
                        {issue.category?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                    <td className="px-4 py-3 mono text-[11px] text-slate-500">{issue.upvotes || 0}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">{issue.citizen?.name || '—'}</td>
                    <td className="px-4 py-3 mono text-[10px] text-slate-600">{new Date(issue.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {filteredIssues.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center mono text-[11px] text-slate-700">NO_RECORDS_FOUND</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
