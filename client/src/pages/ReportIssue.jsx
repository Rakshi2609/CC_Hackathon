import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mic, MicOff, MapPin, ArrowLeft, Send, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

const CAT_COLORS = {
  Pothole: 'border-red-500/40 text-red-400 bg-red-500/10',
  Streetlight: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  Garbage: 'border-amber-600/40 text-amber-500 bg-amber-600/10',
  Drainage: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  'Water Leakage': 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  Others: 'border-slate-500/40 text-slate-400 bg-slate-500/10',
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', latitude: '', longitude: '', address: '' });
  const [image, setImage] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
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
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard?success=1');
    } catch (err) {
      setError(err.response?.data?.message || 'SUBMISSION_FAILED');
    } finally {
      setSubmitting(false);
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* AI Scan Overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md">
          <div className="glass rounded-[8px] p-8 flex flex-col items-center w-80 fade-in">
            <div className="relative w-44 h-44 mb-5 rounded-[4px] overflow-hidden border border-cyan-500/30">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="scan" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <ScanLine size={32} className="text-slate-700" />
                </div>
              )}
              <div className="scan-beam" />
              {/* Corner brackets */}
              {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'], ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, cls]) => (
                <div key={pos} className={`absolute ${pos} w-4 h-4 ${cls} border-cyan-400`} />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span className="mono text-xs text-cyan-400 tracking-widest">AI_VISION_SHIELD</span>
            </div>
            <p className="mono text-[11px] text-slate-600 text-center leading-relaxed">
              ANALYZING: <span className="text-slate-400">{form.category || 'UNCLASSIFIED'}</span><br />
              VERIFYING AUTHENTICITYâ€¦
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 transition-colors mb-4">
            <ArrowLeft size={14} />
            <span className="mono text-[11px] tracking-widest">BACK</span>
          </button>
          <h1 className="text-base font-semibold text-slate-100">New Issue Report</h1>
          <p className="mono text-[11px] text-slate-600 mt-0.5">CIVIC_REPORT Â· AUTHENTICATED_SUBMISSION</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-[6px] p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[4px] bg-red-500/10 border border-red-500/20">
              <span className="mono text-[11px] text-red-400">{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mono text-[10px] text-slate-600 tracking-widest block mb-1.5">ISSUE_TITLE *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-[4px] text-sm border"
              placeholder="e.g. Pothole on MG Road near Signal 4"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mono text-[10px] text-slate-600 tracking-widest block mb-2">CATEGORY *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2 px-2 rounded-[4px] border mono text-[10px] font-semibold tracking-wide transition-all ${form.category === cat
                      ? (CAT_COLORS[cat] || 'border-blue-500 text-blue-400 bg-blue-500/10')
                      : 'border-white/[0.07] text-slate-600 hover:border-white/20 hover:text-slate-400'
                    }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="mono text-[10px] text-slate-600 tracking-widest">DESCRIPTION *</label>
              <button
                type="button"
                onClick={() => startVoice('description')}
                className={`flex items-center gap-1 px-2 py-1 rounded-[3px] border mono text-[10px] transition-all ${listening && voiceField === 'description'
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'border-white/[0.07] text-slate-600 hover:border-white/20 hover:text-slate-400'
                  }`}
              >
                {listening && voiceField === 'description' ? <MicOff size={10} /> : <Mic size={10} />}
                {listening && voiceField === 'description' ? 'STOP' : 'VOICE'}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-[4px] text-sm border resize-none"
              placeholder="Describe severity, size, duration, affected areaâ€¦"
            />
          </div>

          {/* Camera */}
          <CameraCapture onCapture={f => setImage(f || null)} />

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="mono text-[10px] text-slate-600 tracking-widest">COORDINATES *</label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="flex items-center gap-1 mono text-[10px] text-blue-500 hover:text-blue-400 disabled:opacity-40 transition-colors"
              >
                <MapPin size={10} />
                {locating ? 'LOCATINGâ€¦' : 'AUTO_DETECT'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input required value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="px-3 py-2.5 rounded-[4px] text-sm mono border" placeholder="LAT" />
              <input required value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="px-3 py-2.5 rounded-[4px] text-sm mono border" placeholder="LNG" />
            </div>
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-[4px] text-sm border"
              placeholder="Street address or landmark (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !form.category}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-3 rounded-[4px] text-xs font-semibold mono tracking-wide transition-all"
          >
            <Send size={13} />
            {submitting ? 'SUBMITTINGâ€¦' : 'SUBMIT_REPORT'}
          </button>
        </form>
      </div>
    </div>
  );
}
