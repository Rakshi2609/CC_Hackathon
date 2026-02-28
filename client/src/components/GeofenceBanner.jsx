import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import useGeofenceAlerts from '../hooks/useGeofenceAlerts';

export default function GeofenceBanner() {
    const { nearbyAlerts } = useGeofenceAlerts(500);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || nearbyAlerts.length === 0) return null;

    return (
        <div className="mx-4 mt-3 mb-1 glass rounded-[4px] border-l-2 border-amber-500 p-3 flex items-start gap-3 fade-in">
            <div className="w-2 h-2 bg-amber-400 rotate-45 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
                <p className="mono text-[11px] font-semibold text-amber-400 tracking-wide">
                    GEOFENCE_ALERT Â· {nearbyAlerts.length} ISSUE{nearbyAlerts.length > 1 ? 'S' : ''} WITHIN 500m
                </p>
                <ul className="mt-1.5 space-y-1">
                    {nearbyAlerts.slice(0, 3).map(issue => (
                        <li key={issue._id} className="flex items-center gap-1.5">
                            <MapPin size={9} className="text-slate-600 flex-shrink-0" />
                            <span className="mono text-[10px] text-slate-500 truncate">{issue.title}</span>
                            <span className="mono text-[9px] text-slate-700 ml-auto flex-shrink-0">{issue.category?.toUpperCase()}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={() => setDismissed(true)} className="text-slate-700 hover:text-slate-400 transition-colors flex-shrink-0">
                <X size={13} />
            </button>
        </div>
    );
}
