import { useState } from 'react';
import { Cpu, X, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function IotAlertBanner() {
    const { iotAlerts } = useSocket();
    const [expanded, setExpanded] = useState(false);
    const [dismissed, setDismissed] = useState([]);

    const visible = iotAlerts.filter(a => !dismissed.includes(a.id));
    if (visible.length === 0) return null;

    return (
        <div className="mb-4 glass rounded-[4px] border-l-2 border-blue-500/60 overflow-hidden fade-in">
            <button
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="flex items-center gap-2">
                    <Radio size={12} className="text-blue-400" />
                    <span className="mono text-[11px] font-semibold text-blue-400 tracking-widest">
                        IOT_SIGNALS Â· {visible.length} LIVE
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 blink" />
                </div>
                {expanded ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />}
            </button>

            {expanded && (
                <div className="border-t border-white/[0.07] divide-y divide-white/[0.04]">
                    {visible.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                            <Cpu size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="mono text-[11px] font-semibold text-slate-300 truncate">{alert.title}</p>
                                <p className="text-[11px] text-slate-600 mt-0.5">{alert.description}</p>
                                <p className="mono text-[10px] text-slate-700 mt-0.5">
                                    {alert.sensor} Â· {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={() => setDismissed(prev => [...prev, alert.id])}
                                className="text-slate-700 hover:text-slate-400 transition-colors flex-shrink-0"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
