import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';

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
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="bg-white text-green-700 px-2 py-0.5 rounded font-black">C+</span>
          CivicPlus
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user?.role === 'citizen' && (
            <>
              <Link to="/dashboard" className="hover:text-green-200 transition">My Issues</Link>
              <Link to="/report" className="bg-white text-green-700 px-4 py-1.5 rounded-full font-semibold hover:bg-green-50 transition">+ Report Issue</Link>
            </>
          )}
          {user?.role === 'government' && (
            <Link to="/gov-dashboard" className="hover:text-green-200 transition">Dashboard</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {user?.role === 'citizen' && (
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); markAllRead(); }}
                className="relative p-2 hover:bg-green-600 rounded-full transition"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-sm">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-gray-400 text-sm">No notifications yet</p>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y">
                      {notifications.map((n) => (
                        <li key={n.id} className="px-4 py-3 text-sm hover:bg-gray-50">
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-green-600 px-3 py-1.5 rounded-lg transition"
              >
                <div className="w-7 h-7 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm hidden md:block">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm hover:text-green-200">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
