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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">C+</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CivicPlus</span>
          </Link>
          <p className="text-sm text-gray-600 mt-2">Create your account</p>
        </div>

        <div className="card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Get started</h2>
            <p className="text-sm text-gray-600">Choose your role and create an account</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ['citizen', User, 'Citizen', 'Report civic issues'],
              ['government', Shield, 'Government', 'Manage and resolve issues']
            ].map(([role, Icon, title, description]) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${form.role === role
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={form.role === role ? 'text-blue-600' : 'text-gray-500'} />
                  <span className={`text-sm font-medium ${form.role === role ? 'text-blue-900' : 'text-gray-900'}`}>
                    {title}
                  </span>
                </div>
                <p className={`text-xs ${form.role === role ? 'text-blue-700' : 'text-gray-600'}`}>
                  {description}
                </p>
              </button>
            ))}
          </div>

          {form.role === 'government' && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Government accounts require additional verification for security purposes.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-md bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Create a password (min. 6 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  );
}
