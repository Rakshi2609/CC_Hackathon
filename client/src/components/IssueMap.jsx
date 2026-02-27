import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR = {
  pending:      '#ef4444', // red
  'in-progress': '#f59e0b', // amber
  resolved:     '#22c55e', // green
};

const STATUS_LABEL = {
  pending:      '🔴 Pending',
  'in-progress': '🟡 In Progress',
  resolved:     '🟢 Resolved',
};

const CATEGORY_ICONS = {
  Pothole: '🕳️', Streetlight: '💡', Garbage: '🗑️',
  Drainage: '🌊', 'Water Leakage': '💧', Others: '📌',
};

// Auto-fit map to markers
function AutoFit({ issues }) {
  const map = useMap();
  useEffect(() => {
    const valid = issues.filter((i) => i.location?.coordinates?.length === 2);
    if (valid.length === 0) return;
    const bounds = valid.map((i) => [i.location.coordinates[1], i.location.coordinates[0]]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [issues, map]);
  return null;
}

export default function IssueMap({ issues = [], title = 'Issue Heatmap', readOnly = false }) {
  const navigate = useNavigate();
  const validIssues = issues.filter((i) => i.location?.coordinates?.length === 2);

  // Default center — India centroid  
  const defaultCenter = [20.5937, 78.9629];

  if (validIssues.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400 text-sm">
        🗺️ No location data available to display on map yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: STATUS_COLOR[k] }}
              />
              {v.split(' ').slice(1).join(' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFit issues={validIssues} />

        {validIssues.map((issue) => {
          const [lng, lat] = issue.location.coordinates;
          const isClusterPrimary = issue.isCluster && !issue.clusterId;
          const isClusterMember = !!issue.clusterId;
          const memberCount = issue.clusterMembers?.length || 0;

          // Cluster primaries get an orange "hotspot" ring; members get a smaller yellow ring
          let color = STATUS_COLOR[issue.status] || '#6b7280';
          let borderColor = color;
          let radius = 10;
          let weight = 2;

          if (isClusterPrimary) {
            color = '#f97316';     // orange-500 for hotspot
            borderColor = '#ea580c';
            radius = 14 + Math.min(memberCount * 2, 12); // bigger for more members
            weight = 3;
          } else if (isClusterMember) {
            borderColor = '#f97316';
            weight = 2;
            radius = 8;
          }

          return (
            <CircleMarker
              key={issue._id}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: borderColor,
                fillColor: color,
                fillOpacity: isClusterPrimary ? 0.85 : 0.75,
                weight,
              }}
              eventHandlers={readOnly ? {} : {
                click: () => navigate(`/issues/${issue._id}`),
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  {isClusterPrimary && (
                    <p className="font-bold text-orange-600 text-xs">
                      🔥 Hotspot — {memberCount + 1} reports nearby
                    </p>
                  )}
                  {isClusterMember && (
                    <p className="text-orange-500 text-xs">📍 Part of a hotspot cluster</p>
                  )}
                  <p className="font-bold text-gray-900 text-sm leading-tight">{issue.title}</p>
                  <p className="text-gray-500">
                    {CATEGORY_ICONS[issue.category] || '📌'} {issue.category}
                  </p>
                  <p style={{ color: STATUS_COLOR[issue.status] || '#6b7280' }}>
                    {STATUS_LABEL[issue.status] || issue.status}
                  </p>
                  {issue.location?.address && (
                    <p className="text-gray-400">📍 {issue.location.address}</p>
                  )}
                  {issue.citizen?.name && (
                    <p className="text-gray-400">👤 Reported by: <span className="font-medium text-gray-600">{issue.citizen.name}</span></p>
                  )}
                  {issue.upvotes > 0 && (
                    <p className="text-gray-400">👍 {issue.upvotes} upvote{issue.upvotes !== 1 ? 's' : ''}</p>
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="mt-1 text-blue-600 hover:underline font-medium"
                    >
                      View details →
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="px-5 py-2 text-xs text-gray-400 border-t border-gray-50 flex items-center gap-3">
        <span>
          Showing {validIssues.length} issue{validIssues.length !== 1 ? 's' : ''}
        </span>
        {validIssues.some((i) => i.isCluster) && (
          <span className="flex items-center gap-1 text-orange-500 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
            Hot-spot cluster
          </span>
        )}
        <span className="ml-auto">
          {readOnly ? 'Click a pin to view issue info' : 'Click a marker to view details'}
        </span>
      </div>
    </div>
  );
}
