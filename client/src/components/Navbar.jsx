import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Shield, User, LayoutDashboard, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications = [], markAllRead } = useSocket() ?? {};
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07]"
      style={{ background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 bg-blue-600 flex items-center justify-center rounded-[3px]">
            <span className="text-white text-xs font-black tracking-tight">C+</span>
          </div>
          <span className="font-semibold text-slate-100 text-sm tracking-tight">CivicPlus</span>
          <span className="mono text-[10px] text-slate-600 hidden sm:block mt-0.5">v2.0</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {user?.role === 'citizen' && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
              >
                <LayoutDashboard size={13} />
                My Issues
              </Link>
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all"
              >
                <Plus size={13} />
                Report Issue
              </Link>
            </>
          )}
          {user?.role === 'government' && (
            <Link
              to="/gov-dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              <Shield size={13} />
              Command Center
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user?.role === 'citizen' && (
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); markAllRead?.(); }}
                className="relative p-2 rounded-[4px] text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <Bell size={15} />
                {unread > 0 && (
                  <span className="blink absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>

              {showNotifs && (
                <div className="fade-in absolute right-0 mt-2 w-80 glass rounded-[6px] shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 tracking-wide">NOTIFICATIONS</span>
                    <span className="mono text-[10px] text-slate-600">{notifications.length}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-slate-600 text-xs mono">NO_EVENTS</p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
                      {notifications.map((n) => (
                        <li key={n.id} className="px-4 py-3 text-xs text-slate-400 hover:bg-white/5 transition-colors">
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-white/5 transition-all"
              >
                <div className="w-6 h-6 bg-blue-600/30 border border-blue-500/40 rounded-[3px] flex items-center justify-center text-[11px] font-bold text-blue-400">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-slate-400 hidden md:block font-medium">{user.name}</span>
                <ChevronDown size={12} className="text-slate-600 hidden md:block" />
              </button>

              {menuOpen && (
                <div className="fade-in absolute right-0 mt-2 w-48 glass rounded-[6px] shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/[0.07]">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                    <p className="mono text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-200 px-3 py-1.5 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
