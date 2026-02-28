import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, User, AlertCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'citizen' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = form.role === 'government' ? '/auth/create-gov' : '/auth/register';
      const res = await api.post(endpoint, form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'government' ? '/gov-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'REGISTRATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-[4px] flex items-center justify-center">
              <span className="text-white text-sm font-black">C+</span>
            </div>
            <span className="text-xl font-semibold text-slate-100 tracking-tight">CivicPlus</span>
          </div>
          <p className="mono text-[10px] text-slate-700 mt-2 tracking-widest">CREATE_ACCOUNT Â· v2.0</p>
        </div>

        <div className="glass rounded-[6px] p-7">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide">REGISTER</h2>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['citizen', User, 'CITIZEN'], ['government', Shield, 'GOVERNMENT']].map(([r, Icon, lbl]) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex items-center justify-center gap-2 py-2 rounded-[4px] border text-[11px] font-semibold mono tracking-wide transition-all ${form.role === r
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
              >
                <Icon size={12} /> {lbl}
              </button>
            ))}
          </div>
          <p className="mono text-[10px] text-amber-600/70 bg-amber-500/5 border border-amber-500/15 rounded-[3px] px-2.5 py-1.5 mb-4 tracking-wide">
            DEMO: select role before registering
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-[4px] bg-red-500/10 border border-red-500/20">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="mono text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {[['text', 'name', 'FULL_NAME', 'Aarav Singh', true], ['email', 'email', 'EMAIL_ADDRESS', 'user@domain.gov.in', true], ['tel', 'phone', 'PHONE (OPTIONAL)', '+91 9876543210', false]].map(([type, field, label, ph, req]) => (
              <div key={field}>
                <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">{label}</label>
                <input
                  type={type}
                  required={req}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-[4px] text-sm mono border"
                  placeholder={ph}
                />
              </div>
            ))}
            <div>
              <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-[4px] text-sm mono border"
                placeholder="min. 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-2.5 rounded-[4px] text-xs font-semibold transition-all mt-1"
            >
              <UserPlus size={13} />
              {loading ? 'CREATINGâ€¦' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-5 text-center mono text-[10px] text-slate-700">
            HAVE ACCOUNT?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">SIGN IN</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
