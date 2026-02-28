import { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import TransparencyLoop from '../components/TransparencyLoop';
import CompareImage from 'react-compare-image';
import confetti from 'canvas-confetti';
import { SocketContext } from '../context/SocketContext';

const STATUSES = ['pending', 'in-progress', 'resolved'];
const DEPARTMENTS = [
  'Roads & Infrastructure', 'Electricity Department',
  'Solid Waste Management', 'Water & Sanitation', 'General Administration',
];

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [govForm, setGovForm] = useState({ status: '', remark: '', assignedDepartment: '' });
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState('');
  const [cluster, setCluster] = useState(null);
  const { socket } = useContext(SocketContext);
  const confettiFired = useRef(false);
  // Confetti effect on status update to resolved
  useEffect(() => {
    if (!socket || !user || user.role !== 'citizen') return;
    const handler = (data) => {
      if (data.issueId === id && data.status?.toLowerCase() === 'resolved' && !confettiFired.current) {
        confettiFired.current = true;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
          zIndex: 9999,
        });
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
      setToast(
        issue?.isCluster
          ? `Issue updated! All ${(issue.clusterMembers?.length || 0) + 1} reporters notified.`
          : 'Issue updated successfully!'
      );
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Update failed');
      setTimeout(() => setToast(''), 3000);
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mono text-[11px] text-slate-700 tracking-widest">LOADING_RECORD\u2026</p>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const date = new Date(issue.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const STEPPER_COLOR = {
    resolved: { dot: 'bg-emerald-400', line: 'bg-emerald-500/30', text: 'text-emerald-400' },
    'in-progress': { dot: 'bg-amber-400', line: 'bg-amber-500/30', text: 'text-amber-400' },
    pending: { dot: 'bg-red-400', line: 'bg-red-500/30', text: 'text-red-400' },
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 transition-colors mb-5 mono text-[11px] tracking-widest">
          &#8592; BACK
        </button>

        {toast && (
          <div className="mb-4 px-4 py-3 glass rounded-[4px] border-l-2 border-emerald-500 mono text-[11px] text-emerald-400 fade-in">
            SYS: {toast}
          </div>
        )}

        {/* Cluster alert â€” citizen */}
        {user?.role === 'citizen' && cluster?.isInCluster && cluster.totalReports > 1 && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 glass rounded-[4px] border-l-2 border-amber-500 fade-in">
            <div className="w-2 h-2 bg-amber-400 rotate-45 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs font-semibold text-amber-300">
                {cluster.totalReports - 1} other {cluster.totalReports - 1 === 1 ? 'person has' : 'people have'} reported the same issue nearby
              </p>
              <p className="mono text-[10px] text-slate-600 mt-0.5">HOTSPOT_DETECTED \u00b7 AUTHORITY_NOTIFIED</p>
            </div>
          </div>
        )}

        {/* Cluster alert â€” government */}
        {user?.role === 'government' && cluster?.isInCluster && cluster.totalReports > 1 && (
          <div className="mb-5 glass rounded-[6px] p-4 border-l-2 border-amber-500 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-amber-400 rotate-45" />
              <span className="mono text-[11px] text-amber-400 tracking-widest font-semibold">
                CLUSTER_ALERT \u00b7 {cluster.totalReports} REPORTS WITHIN 100m
              </span>
            </div>
            <p className="mono text-[10px] text-slate-600 mb-4">
              RESOLVING THIS ISSUE WILL CASCADE TO ALL {cluster.totalReports} LINKED REPORTS
            </p>
            <div className="space-y-2">
              {cluster.reporters?.map((r, i) => (
                <div key={r.issueId} className="flex items-center justify-between glass-light rounded-[4px] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] text-slate-600 w-5">#{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">{r.name}</p>
                      <p className="mono text-[10px] text-slate-600">{r.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={r.status} />
                    <p className="mono text-[10px] text-slate-700 mt-1">
                      {new Date(r.reportedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main panel */}
          <div className="lg:col-span-2 space-y-5">

            {/* Before/After slider */}
            {(issue.photoUrl || issue.imageUrl) && issue.resolutionPhotoUrl ? (
              <div className="glass rounded-[6px] overflow-hidden">
                <div className="px-4 py-2 border-b border-white/[0.07] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="mono text-[10px] text-slate-500 tracking-widest">BEFORE / AFTER COMPARISON</span>
                </div>
                <CompareImage
                  leftImage={issue.photoUrl ? `http://localhost:5000${issue.photoUrl}` : `http://localhost:5000${issue.imageUrl}`}
                  rightImage={`http://localhost:5000${issue.resolutionPhotoUrl}`}
                  leftImageLabel="BEFORE"
                  rightImageLabel="AFTER"
                  sliderLineColor="#10b981"
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
            <div className="glass rounded-[6px] p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-base font-semibold text-slate-100 leading-snug">{issue.title}</h1>
                <StatusBadge status={issue.status} />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{issue.description}</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.06] pt-4">
                {[
                  ['CATEGORY', issue.category || '\u2014'],
                  ['DEPARTMENT', issue.assignedDepartment || '\u2014'],
                  ['REPORTED_BY', issue.citizen?.name || '\u2014'],
                  ['TIMESTAMP', date],
                  ['COORDINATES', issue.location?.address || `${Number(issue.location?.coordinates?.[1]).toFixed(5)}, ${Number(issue.location?.coordinates?.[0]).toFixed(5)}`],
                  ['UPVOTES', String(issue.upvotes || 0)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="mono text-[9px] text-slate-700 tracking-widest block mb-0.5">{k}</span>
                    <span className="mono text-[11px] text-slate-300">{v}</span>
                  </div>
                ))}
              </div>

              {/* Upvote */}
              {user?.role === 'citizen' && (
                <button
                  onClick={handleUpvote}
                  className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-[4px] border mono text-[11px] font-semibold transition-all ${hasUpvoted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-white/10 text-slate-500 hover:border-blue-500/40 hover:text-blue-400'
                    }`}
                >
                  {hasUpvoted ? 'UPVOTED' : 'UPVOTE'} ({issue.upvotes})
                </button>
              )}

              {issue.governmentRemarks && (
                <div className="mt-4 p-3 rounded-[4px] bg-emerald-500/5 border border-emerald-500/20">
                  <p className="mono text-[9px] text-emerald-600 tracking-widest mb-1">OFFICIAL_REMARKS</p>
                  <p className="text-xs text-slate-400">{issue.governmentRemarks}</p>
                </div>
              )}
            </div>

            {/* Diamond status stepper */}
            {issue.statusHistory?.length > 0 && (
              <div className="glass rounded-[6px] p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  <span className="mono text-[10px] text-slate-500 tracking-widest">STATUS_TIMELINE</span>
                </div>
                <div className="space-y-0">
                  {[...issue.statusHistory].reverse().map((h, i, arr) => {
                    const sc = STEPPER_COLOR[h.status] || STEPPER_COLOR.pending;
                    return (
                      <div key={i} className="flex gap-4">
                        {/* Diamond + line */}
                        <div className="flex flex-col items-center w-4 flex-shrink-0">
                          <div className={`w-3 h-3 rotate-45 border-2 mt-1 flex-shrink-0 ${i === 0 ? `${sc.dot} border-transparent` : 'border-slate-700 bg-transparent'
                            }`} />
                          {i < arr.length - 1 && (
                            <div className={`w-[1px] flex-1 my-1 ${i === 0 ? sc.line : 'bg-slate-800'}`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`pb-5 ${i === arr.length - 1 ? 'pb-0' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={h.status} />
                          </div>
                          {h.remark && <p className="text-[11px] text-slate-500 mt-1">{h.remark}</p>}
                          {h.auditHash && (
                            <p className="mono text-[9px] text-slate-800 mt-1 truncate w-48" title={h.auditHash}>
                              HASH: {h.auditHash.substring(0, 16)}\u2026
                            </p>
                          )}
                          <p className="mono text-[10px] text-slate-700 mt-0.5">
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

          {/* Government sidebar */}
          {user?.role === 'government' && (
            <div className="space-y-4">
              <form onSubmit={handleGovUpdate} className="glass rounded-[6px] p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  <span className="mono text-[10px] text-slate-500 tracking-widest">UPDATE_ISSUE</span>
                </div>

                {issue.isCluster && issue.clusterMembers?.length > 0 && (
                  <div className="mono text-[10px] text-amber-500/70 bg-amber-500/5 border border-amber-500/15 rounded-[3px] px-3 py-2 tracking-wide">
                    CASCADE: {issue.clusterMembers.length + 1} REPORTS WILL BE UPDATED
                  </div>
                )}

                <div>
                  <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">STATUS</label>
                  <select
                    value={govForm.status}
                    onChange={e => setGovForm({ ...govForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-[4px] text-xs mono border"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">DEPARTMENT</label>
                  <select
                    value={govForm.assignedDepartment}
                    onChange={e => setGovForm({ ...govForm, assignedDepartment: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-[4px] text-xs border"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">REMARK</label>
                  <textarea
                    rows={3}
                    value={govForm.remark}
                    onChange={e => setGovForm({ ...govForm, remark: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-[4px] text-xs border resize-none"
                    placeholder="Official update remarks\u2026"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-2.5 rounded-[4px] mono text-[11px] font-semibold tracking-wide transition-all"
                >
                  {updating
                    ? 'UPDATING\u2026'
                    : issue.isCluster
                      ? `UPDATE_ALL (${(issue.clusterMembers?.length || 0) + 1})`
                      : 'PUSH_UPDATE'}
                </button>
              </form>

              <button
                onClick={handleDelete}
                className="w-full py-2.5 rounded-[4px] border border-red-500/20 mono text-[11px] text-red-500/70 hover:bg-red-500/10 hover:text-red-400 transition-all tracking-widest"
              >
                DELETE_ISSUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
