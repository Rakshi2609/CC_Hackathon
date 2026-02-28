// TransparencyLoop.jsx
import React from 'react';

export default function TransparencyLoop({ beforeUrl, afterUrl }) {
    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white/60 backdrop-blur rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-2">Before (Reported)</span>
                {beforeUrl ? (
                    <img src={beforeUrl} alt="Before" className="rounded-xl w-full max-w-xs object-cover shadow" />
                ) : (
                    <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">No image</div>
                )}
            </div>
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-2">After (Resolved)</span>
                {afterUrl ? (
                    <img src={afterUrl} alt="After" className="rounded-xl w-full max-w-xs object-cover shadow" />
                ) : (
                    <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">No image</div>
                )}
            </div>
        </div>
    );
}
