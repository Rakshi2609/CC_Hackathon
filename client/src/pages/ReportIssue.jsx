import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mic, MicOff, MapPin, ArrowLeft, Send, ScanLine, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

const CAT_COLORS = {
  Pothole: 'border-red-300 text-red-700 bg-red-50',
  Streetlight: 'border-amber-300 text-amber-700 bg-amber-50',
  Garbage: 'border-orange-300 text-orange-700 bg-orange-50',
  Drainage: 'border-blue-300 text-blue-700 bg-blue-50',
  'Water Leakage': 'border-cyan-300 text-cyan-700 bg-cyan-50',
  Others: 'border-gray-300 text-gray-700 bg-gray-50',
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', latitude: '', longitude: '', address: '' });
  const [image, setImage] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [aiResult, setAiResult] = useState(null);   // { detectedCategory, aiVerified, aiNote }
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceField, setVoiceField] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => { detectLocation(); }, []);

  const startVoice = (field) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice not supported in this browser.'); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); setVoiceField(null); return; }
    const r = new SR();
    r.lang = 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => { setListening(true); setVoiceField(field); };
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setForm(f => ({ ...f, [field]: f[field] ? f[field] + ' ' + t : t }));
    };
    r.onerror = () => { setListening(false); setVoiceField(null); };
    r.onend = () => { setListening(false); setVoiceField(null); };
    recognitionRef.current = r;
    r.start();
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setScanning(true);
    setAiResult(null);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      const res = await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Show AI classification result for 2.5 s before redirecting
      if (res.data?.meta) {
        setAiResult(res.data.meta);
        setTimeout(() => navigate('/dashboard?success=1'), 2500);
      } else {
        navigate('/dashboard?success=1');
      }
    } catch (err) {
      setScanning(false);
      setError(err.response?.data?.message || 'SUBMISSION_FAILED');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AI Scan Overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="card rounded-xl p-8 flex flex-col items-center max-w-sm mx-4 shadow-xl">
            <div className="relative w-48 h-48 mb-6 rounded-xl overflow-hidden border-2 border-blue-300">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="scan" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ScanLine size={40} className="text-gray-400" />
                </div>
              )}
              {!aiResult && <div className="scan-bar bg-blue-500" />}
              {/* Corner brackets */}
              {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'], ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, cls]) => (
                <div key={pos} className={`absolute ${pos} w-6 h-6 ${cls} border-blue-400 border-2`} />
              ))}
            </div>

            {aiResult ? (
              <>
                <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg border ${aiResult.aiVerified
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-amber-50 border-amber-300 text-amber-700'
                  }`}>
                  {aiResult.aiVerified ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <span className="text-sm font-semibold">
                    {aiResult.aiVerified ? 'AI Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 mb-2">Detected Category</p>
                  <p className="text-lg font-bold text-blue-600">
                    {aiResult.aiDetectedCategory || 'Unknown'}
                  </p>
                </div>

                {aiResult.aiNote && (
                  <p className="text-sm text-gray-600 text-center leading-relaxed mt-3 px-4 italic">
                    "{aiResult.aiNote}"
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <span className="text-lg font-semibold text-blue-600">AI Analysis</span>
                </div>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Analyzing: <span className="font-medium">{form.category || 'Issue type'}</span><br />
                  Processing image classification...
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Report New Issue</h1>
            <p className="text-lg text-gray-600">Submit a civic infrastructure problem with photo evidence</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-blue-700">Step 1 of 1 - Issue Details</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card rounded-xl p-6 lg:p-8 space-y-8 shadow-sm">
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Issue Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="e.g. Large pothole on MG Road near Traffic Signal 4"
                />
                <p className="text-xs text-gray-500">Be specific about location and issue type</p>
              </div>

              {/* Category Grid */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Category *</label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`p-4 rounded-lg border-2 text-sm font-medium transition-all text-left ${form.category === cat
                        ? (CAT_COLORS[cat] || 'border-blue-500 text-blue-700 bg-blue-50')
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description with Voice */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">Description *</label>
                  <button
                    type="button"
                    onClick={() => startVoice('description')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${listening && voiceField === 'description'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 bg-white'
                      }`}
                  >
                    {listening && voiceField === 'description' ? <MicOff size={16} /> : <Mic size={16} />}
                    {listening && voiceField === 'description' ? 'Stop Recording' : 'Voice Input'}
                  </button>
                </div>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-colors"
                  placeholder="Describe the issue in detail: severity, size, how long it's been there, safety concerns, affected area..."
                />
                <p className="text-xs text-gray-500">Provide as much detail as possible for faster resolution</p>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">Location *</label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <MapPin size={16} />
                    {locating ? 'Getting Location...' : 'Use My Location'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      required
                      value={form.latitude}
                      onChange={e => setForm({ ...form, latitude: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      placeholder="0.0000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      required
                      value={form.longitude}
                      onChange={e => setForm({ ...form, longitude: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      placeholder="0.0000"
                    />
                  </div>
                </div>

                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Street address, landmark, or area description (optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !form.category}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg text-base font-semibold transition-colors shadow-sm"
              >
                <Send size={20} />
                {submitting ? 'Submitting Report...' : 'Submit Issue Report'}
              </button>
            </form>
          </div>

          {/* Help Sidebar */}
          <div className="space-y-6">
            {/* Camera Section */}
            <div className="card rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Photo Evidence
                <span className="ml-2 text-xs font-normal text-gray-500">(Recommended)</span>
              </label>
              <CameraCapture onCapture={f => setImage(f || null)} />
            </div>

            <div className="card rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Reporting Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Take clear photos showing the full extent of the problem</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include nearby landmarks or street signs for better location accuracy</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Describe safety concerns or urgency level in your description</p>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="card rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI Verification</p>
                    <p className="text-gray-600">Your photo will be analyzed for authenticity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review & Assignment</p>
                    <p className="text-gray-600">Government team will review and prioritize</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Live Updates</p>
                    <p className="text-gray-600">You'll receive real-time notifications on progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
