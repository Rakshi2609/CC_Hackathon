import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import CitizenDashboard from './pages/CitizenDashboard'
import GovernmentDashboard from './pages/GovernmentDashboard'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import './App.css'

// Route guard helpers
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 text-xs mono tracking-widest">SYS_INIT…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'government' ? '/gov-dashboard' : '/dashboard'} replace />
  }
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'government' ? '/gov-dashboard' : '/dashboard'} replace />
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-[#020617] relative">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* Citizen */}
        <Route path="/dashboard" element={<RequireAuth role="citizen"><CitizenDashboard /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth role="citizen"><ReportIssue /></RequireAuth>} />

        {/* Government */}
        <Route path="/gov-dashboard" element={<RequireAuth role="government"><GovernmentDashboard /></RequireAuth>} />

        {/* Shared */}
        <Route path="/issues/:id" element={<RequireAuth><IssueDetail /></RequireAuth>} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

