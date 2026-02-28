import { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import TransparencyLoop from '../components/TransparencyLoop';
import CompareImage from 'react-compare-image';
import confetti from 'canvas-confetti';
import { SocketContext } from '../context/SocketContext';
import {
  ArrowLeft, ThumbsUp, Trash2, RefreshCw,
  Users, AlertTriangle, CheckCircle2, Clock, MapPin,
} from 'lucide-react';

const STATUSES = ['pending', 'in-progress', 'resolved'];
const DEPARTMENTS = [
  'Roads & Infrastructure', 'Electricity Department',
  'Solid Waste Management', 'Water & Sanitation', 'General Administration',
];

const STATUS_COLOR = {
  resolved: { dot: 'bg-green-500', bar: 'bg-green-100', text: 'text-green-700' },
  'in-progress': { dot: 'bg-amber-400', bar: 'bg-amber-50', text: 'text-amber-700' },
  pending: { dot: 'bg-red-500', bar: 'bg-red-50', text: 'text-red-700' },
};

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [govForm, setGovForm] = useState({ status: '', remark: '', assignedDepartment: '' });
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ msg: '', ok: true });
  const [cluster, setCluster] = useState(null);
  const { socket } = useContext(SocketContext);
  const confettiFired = useRef(false);

  // Live update via socket — re-fetch issue AND fire confetti if resolved
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data.issueId !== id && data.issueId?.toString() !== id) return;
      // Re-fetch to get authoritative server state for all viewers
      fetchIssue();
      if (
        user?.role === 'citizen' &&
        data.status?.toLowerCase() === 'resolved' &&
        !confettiFired.current
      ) {
        confettiFired.current = true;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, zIndex: 9999 });
      }
    };
    socket.on('issue_updated', handler);
    return () => socket.off('issue_updated', handler);
  }, [socket, id, user]);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    setLoading(true);
    try {
      const [issueRes, clusterRes] = await Promise.allSettled([
        api.get(`/issues/${id}`),
        api.get(`/issues/${id}/cluster`),
      ]);

      if (issueRes.status === 'fulfilled') {
        setIssue(issueRes.value.data);
        setGovForm({
          status: issueRes.value.data.status,
          remark: issueRes.value.data.governmentRemarks || '',
          assignedDepartment: issueRes.value.data.assignedDepartment || '',
        });
      } else {
        navigate(-1);
      }

      if (clusterRes.status === 'fulfilled') {
        setCluster(clusterRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/issues/${id}/upvote`);
      setIssue((prev) => ({ ...prev, upvotes: res.data.upvotes, upvotedBy: res.data.upvotedBy }));
    } catch {/* ignore */ }
  };

  const handleGovUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/issues/${id}/status`, govForm);
      setIssue(res.data);
      const isCluster = issue?.isCluster || (issue?.clusterMembers?.length ?? 0) > 0;
      const msg = isCluster
        ? `Updated! All ${(issue.clusterMembers?.length || 0) + 1} reporters notified.`
        : 'Issue updated successfully.';
      setToast({ msg, ok: true });
      setTimeout(() => setToast({ msg: '', ok: true }), 4000);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Update failed', ok: false });
      setTimeout(() => setToast({ msg: '', ok: true }), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue? This action cannot be undone.')) return;
    try {
      await api.delete(`/issues/${id}`);
      navigate('/gov-dashboard');
    } catch {/* ignore */ }
  };

  const hasUpvoted = issue?.upvotedBy?.includes(user?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mono text-[11px] text-gray-400 tracking-widest">LOADING RECORD…</p>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const date = new Date(issue.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors mb-5 mono text-[11px] tracking-widest"
        >
          <ArrowLeft size={13} /> BACK
        </button>

        {toast.msg && (
          <div className={`mb-4 px-4 py-3 rounded-sm border-l-4 mono text-[11px] fade-in ${toast.ok
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-red-50 border-red-500 text-red-700'
            }`}>
            {toast.msg}
          </div>
        )}

        {/* Cluster alert — citizen */}
        {user?.role === 'citizen' && cluster?.isInCluster && cluster.totalReports > 1 && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 rounded-sm fade-in">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">
                {cluster.totalReports - 1} other {cluster.totalReports - 1 === 1 ? 'person has' : 'people have'} reported the same issue nearby
              </p>
              <p className="mono text-[10px] text-amber-600 mt-0.5">HOTSPOT DETECTED · AUTHORITY NOTIFIED</p>
            </div>
          </div>
        )}

        {/* Cluster alert — government */}
        {user?.role === 'government' && cluster?.isInCluster && cluster.totalReports > 1 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 rounded-sm p-4 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-amber-600" />
              <span className="mono text-[11px] text-amber-700 tracking-widest font-semibold">
                CLUSTER ALERT · {cluster.totalReports} REPORTS WITHIN 100m
              </span>
            </div>
            <p className="mono text-[10px] text-amber-600 mb-4">
              RESOLVING THIS ISSUE WILL CASCADE TO ALL {cluster.totalReports} LINKED REPORTS
            </p>
            <div className="space-y-2">
              {cluster.reporters?.map((r, i) => (
                <div key={r.issueId} className="flex items-center justify-between bg-white border border-amber-100 rounded-sm px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] text-gray-400 w-5">#{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                      <p className="mono text-[10px] text-gray-400">{r.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={r.status} />
                    <p className="mono text-[10px] text-gray-400 mt-1">
                      {new Date(r.reportedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Main panel ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Before/After or single image */}
            {(issue.photoUrl || issue.imageUrl) && issue.resolutionPhotoUrl ? (
              <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="mono text-[10px] text-gray-500 tracking-widest">BEFORE / AFTER COMPARISON</span>
                </div>
                <CompareImage
                  leftImage={issue.photoUrl ? `http://localhost:5000${issue.photoUrl}` : `http://localhost:5000${issue.imageUrl}`}
                  rightImage={`http://localhost:5000${issue.resolutionPhotoUrl}`}
                  leftImageLabel="BEFORE"
                  rightImageLabel="AFTER"
                  sliderLineColor="#0f62fe"
                  sliderPositionPercentage={0.5}
                  aspectRatio="wider"
                />
              </div>
            ) : (
              <TransparencyLoop
                beforeUrl={issue.photoUrl ? `http://localhost:5000${issue.photoUrl}` : (issue.imageUrl ? `http://localhost:5000${issue.imageUrl}` : null)}
                afterUrl={issue.resolutionPhotoUrl ? `http://localhost:5000${issue.resolutionPhotoUrl}` : null}
              />
            )}

            {/* Issue details card */}
            <div className="bg-white border border-gray-200 rounded-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-base font-semibold text-gray-900 leading-snug">{issue.title}</h1>
                <StatusBadge status={issue.status} />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{issue.description}</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-100 pt-4">
                {[
                  ['CATEGORY', issue.category || '—'],
                  ['DEPARTMENT', issue.assignedDepartment || '—'],
                  ['REPORTED BY', issue.citizen?.name || '—'],
                  ['TIMESTAMP', date],
                  ['LOCATION', issue.location?.address || `${Number(issue.location?.coordinates?.[1]).toFixed(5)}, ${Number(issue.location?.coordinates?.[0]).toFixed(5)}`],
                  ['UPVOTES', String(issue.upvotes || 0)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="mono text-[9px] text-gray-400 tracking-widest block mb-0.5">{k}</span>
                    <span className="mono text-[11px] text-gray-700">{v}</span>
                  </div>
                ))}
              </div>

              {/* Upvote */}
              {user?.role === 'citizen' && (
                <button
                  onClick={handleUpvote}
                  className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-sm border mono text-[11px] font-semibold transition-all ${hasUpvoted
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                    }`}
                >
                  <ThumbsUp size={12} />
                  {hasUpvoted ? 'UPVOTED' : 'UPVOTE'} ({issue.upvotes})
                </button>
              )}

              {issue.governmentRemarks && (
                <div className="mt-4 p-3 rounded-sm bg-green-50 border border-green-200">
                  <p className="mono text-[9px] text-green-700 tracking-widest mb-1">OFFICIAL REMARKS</p>
                  <p className="text-xs text-gray-700">{issue.governmentRemarks}</p>
                </div>
              )}
            </div>

            {/* Status timeline */}
            {issue.statusHistory?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-sm p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={12} className="text-gray-400" />
                  <span className="mono text-[10px] text-gray-500 tracking-widest uppercase">Status Timeline</span>
                </div>
                <div className="space-y-0">
                  {[...issue.statusHistory].reverse().map((h, i, arr) => {
                    const sc = STATUS_COLOR[h.status] || STATUS_COLOR.pending;
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center w-4 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 border-2 ${i === 0 ? `${sc.dot} border-transparent` : 'border-gray-200 bg-white'
                            }`} />
                          {i < arr.length - 1 && (
                            <div className="w-px flex-1 my-1 bg-gray-200" />
                          )}
                        </div>
                        <div className={`pb-5 ${i === arr.length - 1 ? 'pb-0' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={h.status} />
                          </div>
                          {h.remark && <p className="text-[11px] text-gray-500 mt-1">{h.remark}</p>}
                          {h.auditHash && (
                            <p className="mono text-[9px] text-gray-300 mt-1 truncate w-48" title={h.auditHash}>
                              HASH: {h.auditHash.substring(0, 16)}…
                            </p>
                          )}
                          <p className="mono text-[10px] text-gray-400 mt-0.5">
                            {new Date(h.updatedAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Government sidebar ── */}
          {user?.role === 'government' && (
            <div className="space-y-4">
              <form onSubmit={handleGovUpdate} className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  <span className="mono text-[10px] text-gray-500 tracking-widest uppercase">Update Issue</span>
                </div>

                {(issue.isCluster || (issue.clusterMembers?.length ?? 0) > 0) && (
                  <div className="mono text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 tracking-wide">
                    CASCADE: {issue.clusterMembers.length + 1} REPORTS WILL BE UPDATED
                  </div>
                )}

                <div>
                  <label className="mono text-[10px] text-gray-500 tracking-widest block mb-1.5">STATUS</label>
                  <select
                    value={govForm.status}
                    onChange={e => setGovForm({ ...govForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-sm text-xs mono border border-gray-200 bg-white focus:border-blue-400 focus:outline-none"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono text-[10px] text-gray-500 tracking-widest block mb-1.5">DEPARTMENT</label>
                  <select
                    value={govForm.assignedDepartment}
                    onChange={e => setGovForm({ ...govForm, assignedDepartment: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-sm text-xs border border-gray-200 bg-white focus:border-blue-400 focus:outline-none"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono text-[10px] text-gray-500 tracking-widest block mb-1.5">REMARK</label>
                  <textarea
                    rows={3}
                    value={govForm.remark}
                    onChange={e => setGovForm({ ...govForm, remark: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-sm text-xs border border-gray-200 bg-white resize-none focus:border-blue-400 focus:outline-none"
                    placeholder="Official update remarks…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-sm mono text-[11px] font-semibold tracking-wide transition-colors"
                >
                  <RefreshCw size={11} className={updating ? 'animate-spin' : ''} />
                  {updating
                    ? 'UPDATING…'
                    : (issue.isCluster || (issue.clusterMembers?.length ?? 0) > 0)
                      ? `UPDATE ALL (${(issue.clusterMembers?.length || 0) + 1})`
                      : 'PUSH UPDATE'}
                </button>
              </form>

              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border border-red-200 mono text-[11px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={11} /> DELETE ISSUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
