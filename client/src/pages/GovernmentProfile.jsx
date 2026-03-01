import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Phone, Building2, Edit2, LogOut, BarChart3, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function GovernmentProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch government profile
            const profileResponse = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(profileResponse.data);

            // Fetch all issues for the government dashboard
            const issuesResponse = await axios.get('/api/issues', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIssues(issuesResponse.data || []);

            // Calculate statistics
            const resolved = issuesResponse.data?.filter(i => i.status === 'resolved').length || 0;
            const inProgress = issuesResponse.data?.filter(i => i.status === 'in-progress').length || 0;
            const pending = issuesResponse.data?.filter(i => i.status === 'pending').length || 0;

            setStatistics({
                total: issuesResponse.data?.length || 0,
                resolved,
                inProgress,
                pending,
                resolutionRate: issuesResponse.data?.length ? ((resolved / issuesResponse.data.length) * 100).toFixed(1) : 0
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-l-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Government Portal</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Top Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">Total Issues</span>
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{statistics?.total}</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">Resolved</span>
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{statistics?.resolved}</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">In Progress</span>
                            <TrendingUp size={24} className="text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{statistics?.inProgress}</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">Resolution Rate</span>
                            <Users size={24} className="text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{statistics?.resolutionRate}%</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name}</h2>
                                <p className="text-gray-600 text-sm mt-1">Government Official</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={18} className="text-purple-600" />
                                    <span className="text-sm">{profile?.email || user?.email}</span>
                                </div>
                                {profile?.phone && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone size={18} className="text-purple-600" />
                                        <span className="text-sm">{profile.phone}</span>
                                    </div>
                                )}
                                {profile?.department && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Building2 size={18} className="text-purple-600" />
                                        <span className="text-sm">{profile.department}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-1">Role</div>
                                    <div className="text-lg font-bold text-purple-600">{profile?.role || 'Manager'}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    <Edit2 size={18} />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Issues Management */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Issue Management</h3>

                            {issues.length === 0 ? (
                                <div className="text-center py-12">
                                    <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600">No issues to manage yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {issues.map((issue) => (
                                        <div key={issue._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {issue.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                <span>📍 {issue.category}</span>
                                                <span>•</span>
                                                <span>Priority: {issue.priority || 'Medium'}</span>
                                                <span>•</span>
                                                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
