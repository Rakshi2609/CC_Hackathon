import { useEffect, useState } from 'react';
import api from '../api/axios';

function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function useGeofenceAlerts(radiusMeters = 500) {
    const [nearbyAlerts, setNearbyAlerts] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            api
                .get('/issues', { params: { limit: 200 } })
                .then(({ data }) => {
                    const issues = data.issues || [];
                    const alerts = issues.filter((issue) => {
                        if (!issue.location?.coordinates) return false;
                        const [issueLng, issueLat] = issue.location.coordinates;
                        const dist = haversineMeters(latitude, longitude, issueLat, issueLng);
                        return dist <= radiusMeters && issue.status !== 'resolved';
                    });
                    setNearbyAlerts(alerts.slice(0, 5));
                })
                .catch(() => { });
        });
    }, [radiusMeters]);

    return { nearbyAlerts, userLocation };
}
