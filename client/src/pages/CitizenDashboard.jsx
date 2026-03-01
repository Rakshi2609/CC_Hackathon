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
    <div className="min-h-screen bg-gray-50">
      <GeofenceBanner />

      <div className="container mx-auto px-4 pt-6 pb-16 max-w-7xl">

        {/* Toast */}
        {toast && (
          <div className="mb-6 px-6 py-4 bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-lg text-green-700 text-sm font-medium shadow-sm fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              {toast}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">My Reports Dashboard</h1>
            <p className="text-lg text-gray-600">
              Welcome back, <span className="font-semibold">{user?.name}</span> • Citizen Portal
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              + New Report
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            {
              label: 'Total Reports',
              value: total,
              icon: BarChart3,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-l-blue-500',
              description: 'All time submissions'
            },
            {
              label: 'Pending',
              value: pending,
              icon: AlertCircle,
              color: 'text-red-600',
              bg: 'bg-red-50',
              border: 'border-l-red-500',
              description: 'Awaiting review'
            },
            {
              label: 'In Progress',
              value: inProgress,
              icon: Clock,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-l-amber-500',
              description: 'Being resolved'
            },
            {
              label: 'Resolved',
              value: resolved,
              icon: CheckCircle2,
              color: 'text-green-600',
              bg: 'bg-green-50',
              border: 'border-l-green-500',
              description: 'Successfully fixed'
            },
          ].map(s => (
            <div key={s.label} className={`card border-l-4 ${s.border} rounded-lg p-6 hover:shadow-md transition-shadow fade-in`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>
                  <s.icon size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl lg:text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm font-medium text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section with Enhanced UI */}
        <div className="mb-8">
          <div className="card rounded-xl shadow-sm overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">City Issues Map</h3>
                    <p className="text-sm text-gray-600">Live view of all reported issues in your area</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMap(v => !v)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
            </div>
            {showMap && (
              <div className="h-96 lg:h-[32rem]">
                <IssueMap issues={mapIssues} title="All City Issues" readOnly />
              </div>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="card rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Filter Reports</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-colors"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') : 'All Status'}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-colors"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Reports {total > 0 && <span className="text-gray-500 font-normal">({total} total)</span>}
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton rounded-xl h-80" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="card rounded-xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter || categoryFilter
                  ? 'Try adjusting your filters or create a new report.'
                  : 'Get started by reporting your first civic issue.'}
              </p>
              {!statusFilter && !categoryFilter && (
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Submit First Report
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {issues.map((issue, index) => (
                  <div key={issue._id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <IssueCard issue={issue} />
                  </div>
                ))}
              </div>

              {pages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} className="text-gray-500" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors border ${page === i + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} className="text-gray-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
