import { useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | live | preview
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // rear cam default

  // Start camera
  const startCamera = async (mode = facingMode) => {
    setError('');
    try {
      // Stop any existing stream first
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPhase('live');
    } catch (err) {
      setError('Camera access denied or not available. Please allow camera permissions.');
      console.error(err);
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Capture snapshot from video
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);
    stopStream();
    setPhase('preview');

    // Convert base64 to File and pass up
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, dataUrl);
      },
      'image/jpeg',
      0.9
    );
  };

  const retake = () => {
    setPreview('');
    onCapture(null, '');
    startCamera(facingMode);
  };

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Photo <span className="text-xs text-gray-400">(live camera only)</span>
      </label>

      {/* Idle state */}
      {phase === 'idle' && (
        <button
          type="button"
          onClick={() => startCamera()}
          className="w-full h-40 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
        >
          <span className="text-4xl">📷</span>
          <p className="text-sm font-medium text-blue-700">Open Camera</p>
          <p className="text-xs text-gray-400">Tap to launch live camera</p>
        </button>
      )}

      {/* Live viewfinder */}
      {phase === 'live' && (
        <div className="relative rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-72 object-cover"
          />
          {/* Controls overlay */}
          <div className="absolute bottom-0 inset-x-0 pb-4 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent">
            {/* Flip */}
            <button
              type="button"
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition text-lg"
              title="Flip camera"
            >
              🔄
            </button>
            {/* Shutter */}
            <button
              type="button"
              onClick={capture}
              className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 shadow-lg hover:scale-95 active:scale-90 transition-transform"
              title="Capture"
            />
            {/* Cancel */}
            <button
              type="button"
              onClick={() => { stopStream(); setPhase('idle'); }}
              className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition text-lg"
              title="Cancel"
            >
              ✕
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview of captured photo */}
      {phase === 'preview' && preview && (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Captured" className="w-full max-h-72 object-cover rounded-2xl" />
          <button
            type="button"
            onClick={retake}
            className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition font-medium"
          >
            🔄 Retake
          </button>
          <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            ✓ Photo captured
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
