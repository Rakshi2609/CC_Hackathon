import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Phone, MapPin, Edit2, LogOut, Award, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function CitizenProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);

            // Fetch user's reported issues
            const issuesResponse = await axios.get('/api/issues/my-issues', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIssues(issuesResponse.data || []);
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
                    <h1 className="text-2xl font-bold text-gray-900">Citizen Profile</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name}</h2>
                                <p className="text-gray-600 text-sm mt-1">Citizen Account</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={18} className="text-blue-600" />
                                    <span className="text-sm">{profile?.email || user?.email}</span>
                                </div>
                                {profile?.phone && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone size={18} className="text-blue-600" />
                                        <span className="text-sm">{profile.phone}</span>
                                    </div>
                                )}
                                {profile?.location && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MapPin size={18} className="text-blue-600" />
                                        <span className="text-sm">{profile.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">{issues.length}</div>
                                    <div className="text-sm text-gray-600">Issues Reported</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

                    {/* Issues List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Reported Issues</h3>

                            {issues.length === 0 ? (
                                <div className="text-center py-12">
                                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600 mb-4">No issues reported yet</p>
                                    <Link
                                        to="/report-issue"
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Report First Issue
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {issues.map((issue) => (
                                        <div key={issue._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {issue.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                <span>{issue.category}</span>
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
