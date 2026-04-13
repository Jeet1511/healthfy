/**
 * Location tracking service
 * Handles real-time geolocation using navigator.geolocation API
 */

export const LOCATION_ACCURACY = {
  HIGH: { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
  NORMAL: { enableHighAccuracy: false, maximumAge: 3000, timeout: 15000 },
  LOW: { enableHighAccuracy: false, maximumAge: 10000, timeout: 20000 },
};

/**
 * Get single location update
 */
export function getCurrentLocation(accuracy = "NORMAL") {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported on this device"));
      return;
    }

    const options = LOCATION_ACCURACY[accuracy] || LOCATION_ACCURACY.NORMAL;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      options
    );
  });
}

/**
 * Watch location continuously
 * Returns watch ID for cleanup
 */
export function watchLocation(callback, onError, accuracy = "NORMAL") {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation not supported on this device"));
    return null;
  }

  const options = LOCATION_ACCURACY[accuracy] || LOCATION_ACCURACY.NORMAL;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
      callback(location);
    },
    (error) => {
      onError?.(new Error(`Geolocation error: ${error.message}`));
    },
    options
  );

  return watchId;
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two points (in kilometers)
 * Using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get location path history and detect unusual patterns
 */
export function analyzeLocationPath(locationHistory) {
  if (!locationHistory || locationHistory.length < 2) {
    return null;
  }

  const speeds = [];
  for (let i = 1; i < locationHistory.length; i++) {
    const prev = locationHistory[i - 1];
    const current = locationHistory[i];
    const distance = calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);
    const timeDiffSeconds = (current.timestamp - prev.timestamp) / 1000;
    const speed = timeDiffSeconds > 0 ? (distance / timeDiffSeconds) * 3600 : 0; // km/h
    speeds.push(speed);
  }

  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);
  const isStationary = avgSpeed < 0.1; // Less than 0.1 km/h
  const isRapidMovement = maxSpeed > 100; // More than 100 km/h

  return {
    averageSpeed: avgSpeed,
    maxSpeed,
    isStationary,
    isRapidMovement,
    totalDistance: speeds.length * avgSpeed * (3000 / 3600), // Assuming 3sec intervals
  };
}

/**
 * Generate shareable location link
 */
export function generateLocationShareLink(latitude, longitude, service = "google") {
  const services = {
    google: `https://maps.google.com/?q=${latitude},${longitude}`,
    apple: `maps://maps.apple.com/?q=${latitude},${longitude}`,
    osm: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`,
  };

  return services[service] || services.google;
}

/**
 * Find nearby locations
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusKm
 * @param {Array} locations - Array of nearby locations with lat/lon
 */
export function findNearbyLocations(latitude, longitude, radiusKm, locations) {
  return locations
    .map((loc) => ({
      ...loc,
      distance: calculateDistance(latitude, longitude, loc.latitude, loc.longitude),
    }))
    .filter((loc) => loc.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Mock emergency locations (hospitals, police, fire stations)
 */
export function getMockEmergencyLocations(latitude, longitude) {
  // In production, use real API (Google Places, OSM, etc.)
  const mockLocations = [
    {
      id: "hospital_1",
      name: "Central Hospital",
      type: "hospital",
      latitude: latitude + 0.003,
      longitude: longitude + 0.003,
      phone: "+91-11-2658-8500",
    },
    {
      id: "police_1",
      name: "Police Station - Main",
      type: "police",
      latitude: latitude - 0.002,
      longitude: longitude + 0.004,
      phone: "100",
    },
    {
      id: "fire_1",
      name: "Fire Station",
      type: "fire",
      latitude: latitude + 0.005,
      longitude: longitude - 0.002,
      phone: "101",
    },
  ];

  return findNearbyLocations(latitude, longitude, 5, mockLocations);
}
