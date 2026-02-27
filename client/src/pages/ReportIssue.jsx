import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

export default function ReportIssue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleCapture = (file) => {
    setImage(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);

      await api.post('/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/dashboard?success=1');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-green-700 text-sm hover:underline mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-500 text-sm mt-1">Help improve your city by reporting civic problems</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="e.g. Large pothole on MG Road"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition ${
                    form.category === cat
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              placeholder="Describe the issue in detail — size, severity, how long it's been there…"
            />
          </div>

          {/* Camera Capture */}
          <CameraCapture onCapture={handleCapture} />

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="text-xs text-green-700 hover:underline disabled:opacity-50"
              >
                {locating ? 'Detecting…' : '📍 Auto-detect'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Latitude"
              />
              <input
                required
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Longitude"
              />
            </div>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Street address or landmark (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !form.category}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting…' : 'Submit Issue Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
