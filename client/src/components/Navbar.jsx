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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 bg-blue-600 flex items-center justify-center rounded-sm">
            <span className="text-white text-xs font-black tracking-tight">C+</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">CivicPlus</span>
          <span className="mono text-[10px] text-gray-400 hidden sm:block mt-0.5">v2.0</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {user?.role === 'citizen' && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LayoutDashboard size={13} />
                My Issues
              </Link>
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={13} />
                Report Issue
              </Link>
            </>
          )}
          {user?.role === 'government' && (
            <Link
              to="/gov-dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
                className="relative p-2 rounded-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Bell size={15} />
                {unread > 0 && (
                  <span className="blink absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>

              {showNotifs && (
                <div className="fade-in absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-sm shadow-md overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 tracking-wide">Notifications</span>
                    <span className="mono text-[10px] text-gray-400">{notifications.length}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-gray-400 text-xs mono tracking-widest">NO EVENTS</p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.map((n) => (
                        <li key={n.id} className="px-4 py-3 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
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
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 bg-blue-100 border border-blue-200 rounded-sm flex items-center justify-center text-[11px] font-bold text-blue-700">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-gray-700 hidden md:block font-medium">{user.name}</span>
                <ChevronDown size={12} className="text-gray-400 hidden md:block" />
              </button>

              {menuOpen && (
                <div className="fade-in absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-sm shadow-md overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="mono text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
