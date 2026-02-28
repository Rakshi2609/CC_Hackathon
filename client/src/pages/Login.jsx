import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'government' ? '/gov-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'AUTH_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {/* Grid BG */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="w-full max-w-sm relative z-10 fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-[4px] flex items-center justify-center">
              <span className="text-white text-sm font-black">C+</span>
            </div>
            <span className="text-xl font-semibold text-slate-100 tracking-tight">CivicPlus</span>
          </div>
          <p className="mono text-[10px] text-slate-700 mt-2 tracking-widest">SECURE_ACCESS_PORTAL Â· v2.0</p>
        </div>

        <div className="glass rounded-[6px] p-7">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide">AUTHENTICATE</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-[4px] bg-red-500/10 border border-red-500/20">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="mono text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">EMAIL_ADDRESS</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-[4px] text-sm mono border"
                placeholder="user@domain.gov.in"
              />
            </div>
            <div>
              <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">PASSWORD</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-[4px] text-sm mono border"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-2.5 rounded-[4px] text-xs font-semibold transition-all"
            >
              <LogIn size={13} />
              {loading ? 'AUTHENTICATINGâ€¦' : 'SIGN IN'}
            </button>
          </form>

          <p className="mt-5 text-center mono text-[10px] text-slate-700">
            NO ACCOUNT?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 transition-colors">REGISTER</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
