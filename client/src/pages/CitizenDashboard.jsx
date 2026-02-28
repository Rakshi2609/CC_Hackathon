import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import IssueMap from '../components/IssueMap';
import GeofenceBanner from '../components/GeofenceBanner';
import { MapPin, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';

const STATUSES = ['', 'pending', 'in-progress', 'resolved'];
const CATEGORIES = ['', 'Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toast, setToast] = useState(searchParams.get('success') ? 'Issue submitted successfully!' : '');
  const [mapIssues, setMapIssues] = useState([]);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => { fetchMapIssues(); }, []);
  useEffect(() => { fetchIssues(); }, [statusFilter, categoryFilter, page]);

  const fetchMapIssues = async () => {
    try { const res = await api.get('/issues/map'); setMapIssues(res.data); } catch { /* ignore */ }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/issues/my?${params}`);
      setIssues(res.data.issues);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { /* ignore */
    } finally { setLoading(false); }
  };

  const pending = issues.filter(i => i.status === 'pending').length;
  const inProgress = issues.filter(i => i.status === 'in-progress').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[#020617]">
      <GeofenceBanner />

      <div className="max-w-7xl mx-auto px-4 pt-5 pb-16">

        {/* Toast */}
        {toast && (
          <div className="mb-4 px-4 py-3 glass rounded-[4px] border-l-2 border-emerald-500 text-emerald-400 text-xs font-medium mono fade-in">
            SYS: {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-base font-semibold text-slate-100">My Reports</h1>
            <p className="mono text-[11px] text-slate-600 mt-0.5">
              USER:{user?.name?.toUpperCase().replace(' ', '_')} &middot; CITIZEN_PORTAL
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-[4px] text-xs font-semibold transition-all"
          >
            + New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'TOTAL', value: total, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'PENDING', value: pending, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'IN PROGRESS', value: inProgress, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'RESOLVED', value: resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(s => (
            <div key={s.label} className="glass rounded-[6px] p-4 flex items-center gap-3 fade-in">
              <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
                <s.icon size={15} />
              </div>
              <div>
                <p className={`mono text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-600 mt-0.5 tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-400">City Issues Map</span>
            </div>
            <button
              onClick={() => setShowMap(v => !v)}
              className="mono text-[10px] text-slate-600 hover:text-slate-400 transition-colors tracking-widest"
            >
              {showMap ? 'HIDE_MAP' : 'SHOW_MAP'}
            </button>
          </div>
          {showMap && (
            <div className="rounded-[6px] overflow-hidden border border-white/[0.07]">
              <IssueMap issues={mapIssues} title="All City Issues" readOnly />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-2 px-2 py-1.5 glass rounded-[4px]">
            <Filter size={11} className="text-slate-600" />
            <span className="mono text-[10px] text-slate-600 tracking-widest">FILTER</span>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-[4px] text-xs border"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s ? s.toUpperCase() : 'ALL STATUS'}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-[4px] text-xs border"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c || 'ALL CATEGORIES'}</option>
            ))}
          </select>
        </div>

        {/* Issues grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton rounded-[6px] h-64" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border border-dashed border-slate-700 rounded-[4px] flex items-center justify-center mx-auto mb-4">
              <MapPin size={20} className="text-slate-700" />
            </div>
            <p className="mono text-xs text-slate-700 tracking-widest">NO_RECORDS_FOUND</p>
            {!statusFilter && !categoryFilter && (
              <Link to="/report" className="inline-block mt-4 text-xs text-blue-500 hover:text-blue-400 transition-colors mono tracking-wide">
                SUBMIT_FIRST_REPORT
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map(issue => <IssueCard key={issue._id} issue={issue} />)}
            </div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-[3px] glass hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={14} className="text-slate-400" />
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`mono w-8 h-8 rounded-[3px] text-xs font-medium transition-all ${page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'glass text-slate-500 hover:text-slate-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-1.5 rounded-[3px] glass hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
