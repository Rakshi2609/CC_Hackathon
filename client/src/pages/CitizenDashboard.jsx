import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import IssueMap from '../components/IssueMap';

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

  useEffect(() => {
    fetchMapIssues();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, categoryFilter, page]);

  const fetchMapIssues = async () => {
    try {
      const res = await api.get('/issues/map');
      setMapIssues(res.data);
    } catch {/* ignore */}
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Stats from issues
  const pending = issues.filter((i) => i.status === 'pending').length;
  const inProgress = issues.filter((i) => i.status === 'in-progress').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toast */}
        {toast && (
          <div className="mb-4 px-5 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            ✅ {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Issues</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name} 👋</p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-800 transition text-sm"
          >
            + Report New Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reported', value: total, color: 'blue', icon: '📝' },
            { label: 'Pending', value: pending, color: 'red', icon: '🔴' },
            { label: 'In Progress', value: inProgress, color: 'yellow', icon: '🟡' },
            { label: 'Resolved', value: resolved, color: 'green', icon: '🟢' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-700 text-sm">📍 All City Issues</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click a pin to see what the issue is</p>
            </div>
            <button
              onClick={() => setShowMap((v) => !v)}
              className="text-xs text-green-600 hover:underline"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          {showMap && <IssueMap issues={mapIssues} title="All City Issues" readOnly />}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
        </div>

        {/* Issues grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🏙️</p>
            <h3 className="font-semibold text-gray-700 text-lg">No issues found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter || categoryFilter ? 'Try clearing your filters' : 'Report your first civic issue'}
            </p>
            <Link to="/report" className="inline-block mt-4 text-green-700 font-medium hover:underline text-sm">
              + Report an Issue
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                      page === i + 1
                        ? 'bg-green-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
