/**
 * Live Map Integration Component
 * Real-time location tracking with map visualization
 * Shows current location, tracking history, and distance traveled
 * Supports Leaflet or Google Maps
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./LiveMapIntegration.css";

function LiveMapIntegration({
  currentLocation = null,
  locationHistory = [],
  onClose = null,
  zoom = 16,
}) {
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapType, setMapType] = useState("leaflet"); // leaflet or google
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState(null);

  /**
   * Calculate total distance traveled
   */
  useEffect(() => {
    if (locationHistory.length < 2) {
      setDistance(0);
      return;
    }

    let totalDistance = 0;
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      const dist = calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      totalDistance += dist;
    }

    setDistance(totalDistance);
    if (currentLocation) {
      setAccuracy(currentLocation.accuracy);
    }
  }, [locationHistory, currentLocation]);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!mapRef.current || mapInitialized) {
      return;
    }

    // Check for Leaflet
    if (window.L) {
      initializeLeafletMap();
      setMapInitialized(true);
      return;
    }

    // Fallback: Simple canvas-based map
    initializeCanvasMap();
    setMapInitialized(true);
  }, [mapInitialized, currentLocation]);

  /**
   * Initialize Leaflet map
   */
  const initializeLeafletMap = () => {
    try {
      const map = window.L.map(mapRef.current).setView(
        [currentLocation?.latitude || 0, currentLocation?.longitude || 0],
        zoom
      );

      // Add tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add current location marker
      if (currentLocation) {
        window.L.circleMarker(
          [currentLocation.latitude, currentLocation.longitude],
          {
            radius: 6,
            fillColor: "#DC2626",
            color: "#991B1B",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }
        )
          .addTo(map)
          .bindPopup(
            `Current Location<br>Accuracy: ${currentLocation.accuracy?.toFixed(1)}m`
          );
      }

      // Add location history trail
      if (locationHistory.length > 1) {
        const latlngs = locationHistory.map((loc) => [
          loc.latitude,
          loc.longitude,
        ]);

        window.L.polyline(latlngs, {
          color: "#2563EB",
          weight: 2,
          opacity: 0.7,
          smoothFactor: 1.0,
        }).addTo(map);
      }

      // Fit bounds
      if (locationHistory.length > 0) {
        const bounds = window.L.latLngBounds(
          locationHistory.map((loc) => [loc.latitude, loc.longitude])
        );
        map.fitBounds(bounds);
      }

      setMapType("leaflet");
    } catch (err) {
      console.error("Leaflet map initialization failed:", err);
      initializeCanvasMap();
    }
  };

  /**
   * Initialize simple canvas-based map
   */
  const initializeCanvasMap = () => {
    const canvas = document.createElement("canvas");
    canvas.className = "canvas-map";
    canvas.width = mapRef.current.clientWidth;
    canvas.height = mapRef.current.clientHeight;
    mapRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw location trail
    if (locationHistory.length > 1) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 0.00001; // Adjust based on region

      ctx.strokeStyle = "#2563EB";
      ctx.lineWidth = 2;
      ctx.beginPath();

      locationHistory.forEach((loc, idx) => {
        const x = centerX + loc.longitude * scale * canvas.width;
        const y = centerY - loc.latitude * scale * canvas.height;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw current location
    if (currentLocation) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 0.00001;

      const x = centerX + currentLocation.longitude * scale * canvas.width;
      const y = centerY - currentLocation.latitude * scale * canvas.height;

      // Draw circle
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#991B1B";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setMapType("canvas");
  };

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  return (
    <motion.div
      className="live-map-container"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      role="region"
      aria-label="Live location map"
    >
      <div className="map-header">
        <h3>📍 Live Location Tracking</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="map-close-btn"
            aria-label="Close map"
          >
            ✕
          </button>
        )}
      </div>

      {/* Map */}
      <div className="map-canvas" ref={mapRef} aria-label="Map showing current location and tracking history" />

      {/* Stats */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-label">Current Location:</span>
          <span className="stat-value">
            {currentLocation
              ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
              : "Tracking..."}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Accuracy:</span>
          <span className="stat-value">
            {accuracy
              ? `${accuracy.toFixed(1)}m`
              : "Waiting..."}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Distance Traveled:</span>
          <span className="stat-value">
            {distance > 1000
              ? `${(distance / 1000).toFixed(2)} km`
              : `${distance.toFixed(0)} m`}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Points Recorded:</span>
          <span className="stat-value">{locationHistory.length}</span>
        </div>
      </div>

      {/* Map Type Indicator */}
      <div className="map-info">
        <small>
          {mapType === "leaflet"
            ? "OpenStreetMap"
            : "Local Map"}
        </small>
      </div>
    </motion.div>
  );
}

export default LiveMapIntegration;
