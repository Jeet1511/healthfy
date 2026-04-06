/**
 * Danger Zone Detection Service
 * Identifies high-risk areas and alerts users
 */

export const ZONE_SEVERITY = {
  SAFE: "safe",
  CAUTION: "caution",
  WARNING: "warning",
  DANGER: "danger",
};

export const ZONE_TYPES = {
  CRIME_HOTSPOT: "crime_hotspot",
  ACCIDENT_PRONE: "accident_prone",
  GANG_TERRITORY: "gang_territory",
  RISKY_AREA: "risky_area",
  USER_REPORTED: "user_reported",
};

/**
 * Mock danger zone database
 * In production, integrate with real crime data sources
 */
const MOCK_DANGER_ZONES = [
  {
    id: "zone_1",
    name: "Downtown Late Night",
    latitude: 28.6139,
    longitude: 77.209,
    radius: 0.5, // km
    severity: ZONE_SEVERITY.WARNING,
    type: ZONE_TYPES.CRIME_HOTSPOT,
    crimeCount: 45,
    timeOfDay: ["night"], // Most dangerous at night
    description: "High incidents reported between 10 PM - 6 AM",
  },
  {
    id: "zone_2",
    name: "Industrial Area Unsafe",
    latitude: 28.62,
    longitude: 77.21,
    radius: 0.8,
    severity: ZONE_SEVERITY.DANGER,
    type: ZONE_TYPES.ACCIDENT_PRONE,
    incidentCount: 28,
    timeOfDay: ["day", "night"],
    description: "Heavy traffic and industrial accidents common",
  },
  {
    id: "zone_3",
    name: "Park After Dark",
    latitude: 28.615,
    longitude: 77.2,
    radius: 0.3,
    severity: ZONE_SEVERITY.CAUTION,
    type: ZONE_TYPES.USER_REPORTED,
    reports: 12,
    timeOfDay: ["night"],
    description: "User-reported unsafe incidents",
  },
];

/**
 * Check if location is in danger zone
 */
export function checkDangerZone(latitude, longitude) {
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour >= 6 && currentHour < 18 ? "day" : "night";

  for (const zone of MOCK_DANGER_ZONES) {
    const distance = calculateZoneDistance(latitude, longitude, zone);

    // Check if within zone
    if (distance <= zone.radius) {
      // Check if dangerous at this time
      if (zone.timeOfDay.includes(timeOfDay) || zone.timeOfDay.length === 0) {
        return {
          inDanger: true,
          zone,
          distance,
          timeOfDay,
        };
      }
    }
  }

  return {
    inDanger: false,
    zone: null,
    distance: null,
    timeOfDay,
  };
}

/**
 * Calculate distance from point to zone center
 */
function calculateZoneDistance(lat1, lon1, zone) {
  const R = 6371; // Earth's radius in km
  const dLat = ((zone.latitude - lat1) * Math.PI) / 180;
  const dLon = ((zone.longitude - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((zone.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get zones near location
 */
export function getNearbyDangerZones(latitude, longitude, radiusKm = 2) {
  const nearby = MOCK_DANGER_ZONES.map((zone) => ({
    ...zone,
    distance: calculateZoneDistance(latitude, longitude, zone),
  }))
    .filter((zone) => zone.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return nearby;
}

/**
 * Get zone risk level (0-100)
 */
export function getRiskLevel(severity, timeOfDay, crowding = 0.5) {
  const severityScores = {
    [ZONE_SEVERITY.SAFE]: 10,
    [ZONE_SEVERITY.CAUTION]: 35,
    [ZONE_SEVERITY.WARNING]: 65,
    [ZONE_SEVERITY.DANGER]: 90,
  };

  const baseScore = severityScores[severity] || 0;
  const timeMultiplier = timeOfDay === "night" ? 1.3 : 1.0;
  const finalScore = Math.min(100, baseScore * timeMultiplier + crowding * 5);

  return Math.round(finalScore);
}

/**
 * Get danger zone heatmap data
 */
export function getHeatmapData() {
  return MOCK_DANGER_ZONES.map((zone) => ({
    latitude: zone.latitude,
    longitude: zone.longitude,
    intensity: getRiskLevel(zone.severity, "night") / 100, // 0-1
    radius: zone.radius * 1000, // Convert to meters
    zone,
  }));
}

/**
 * Report user-observed danger
 */
export function reportDangerZone(latitude, longitude, description, contactUs = true) {
  const newZone = {
    id: `zone_user_${Date.now()}`,
    name: `User Report - ${new Date().toLocaleString()}`,
    latitude,
    longitude,
    radius: 0.2,
    severity: ZONE_SEVERITY.CAUTION,
    type: ZONE_TYPES.USER_REPORTED,
    description,
    reports: 1,
    timeOfDay: [new Date().getHours() >= 6 && new Date().getHours() < 18 ? "day" : "night"],
    timestamp: new Date().toISOString(),
  };

  // In production, save to backend
  console.log("[MOCK] Danger zone reported:", newZone);

  return newZone;
}

/**
 * Get safety recommendations based on location
 */
export function getSafetyRecommendations(latitude, longitude) {
  const dangerCheck = checkDangerZone(latitude, longitude);
  const nearbyZones = getNearbyDangerZones(latitude, longitude, 1);

  const recommendations = [];

  if (dangerCheck.inDanger) {
    recommendations.push({
      level: "danger",
      message: `⚠️ WARNING: You are in a ${dangerCheck.zone.severity} area`,
      details: dangerCheck.zone.description,
      action: "Consider leaving immediately or staying in groups",
    });
  }

  if (nearbyZones.length > 0 && !dangerCheck.inDanger) {
    recommendations.push({
      level: "caution",
      message: `⚠️ CAUTION: Nearby danger zone detected`,
      details: `${nearbyZones[0].name} is ${(nearbyZones[0].distance * 1000).toFixed(0)}m away`,
      action: "Avoid this area if possible",
    });
  }

  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour <= 6) {
    recommendations.push({
      level: "info",
      message: "🌙 It's late night - extra caution recommended",
      details: "Crime rates are typically higher after 10 PM",
      action: "Stay aware and keep emergency contacts handy",
    });
  }

  return recommendations;
}

/**
 * Analyze movement pattern for safe travel
 */
export function analyzeMovementSafety(locationHistory) {
  if (!locationHistory || locationHistory.length < 2) {
    return { safe: true, warnings: [] };
  }

  const warnings = [];
  const dangerZonesEncountered = new Set();

  for (const location of locationHistory) {
    const dangerCheck = checkDangerZone(location.latitude, location.longitude);
    if (dangerCheck.inDanger) {
      dangerZonesEncountered.add(dangerCheck.zone.id);
      warnings.push(`Entered danger zone: ${dangerCheck.zone.name}`);
    }
  }

  return {
    safe: dangerZonesEncountered.size === 0,
    warningsCount: dangerZonesEncountered.size,
    warnings,
    dangerZonesEncountered: Array.from(dangerZonesEncountered),
  };
}
