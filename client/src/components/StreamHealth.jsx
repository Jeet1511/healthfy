/**
 * Stream Health Component
 * Real-time monitoring of streaming performance
 * Shows bitrate, network conditions, and health indicators
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./StreamHealth.css";

function StreamHealth({ stats = null }) {
  const [healthStatus, setHealthStatus] = useState("good");
  const [networkInfo, setNetworkInfo] = useState(null);

  /**
   * Determine health status
   */
  useEffect(() => {
    if (!stats) return;

    const bitrate = parseFloat(stats.averageBitrate);

    if (bitrate > 4) {
      setHealthStatus("excellent");
    } else if (bitrate > 2) {
      setHealthStatus("good");
    } else if (bitrate > 1) {
      setHealthStatus("fair");
    } else {
      setHealthStatus("poor");
    }

    // Get network info
    if (navigator.connection) {
      setNetworkInfo({
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      });
    }
  }, [stats]);

  if (!stats) {
    return (
      <motion.div
        className="stream-health"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        role="region"
        aria-label="Stream health monitoring"
      >
        <p className="loading">Loading stream information...</p>
      </motion.div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return "✅";
      case "good":
        return "👍";
      case "fair":
        return "⚠️";
      case "poor":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <motion.div
      className="stream-health"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      role="region"
      aria-label="Stream health monitoring"
    >
      <div className="health-header">
        <h3>📊 Stream Health</h3>
        <span className={`health-badge ${healthStatus}`}>
          {getStatusIcon(healthStatus)} {healthStatus.toUpperCase()}
        </span>
      </div>

      <div className="health-grid">
        {/* Bitrate */}
        <div className="health-item">
          <div className="health-label">Average Bitrate</div>
          <div className="health-value">{stats.averageBitrate} Mbps</div>
          <div className="health-bar">
            <motion.div
              className="health-bar-fill"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (stats.averageBitrate / 5) * 100,
                  100
                )}%`,
              }}
              transition={{ duration: 0.5 }}
              role="progressbar"
              aria-valuenow={parseFloat(stats.averageBitrate)}
              aria-valuemin={0}
              aria-valuemax={5}
            />
          </div>
        </div>

        {/* Chunks */}
        <div className="health-item">
          <div className="health-label">Chunks Recorded</div>
          <div className="health-value">{stats.chunks}</div>
          <div className="health-subtext">
            ~{(stats.totalBytes / 1024 / 1024).toFixed(1)} MB
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="health-item">
          <div className="health-label">Recording Duration</div>
          <div className="health-value">{stats.elapsed}s</div>
          <div className="health-subtext">
            {Math.floor(stats.elapsed / 60)}m{" "}
            {stats.elapsed % 60}s
          </div>
        </div>

        {/* Quality */}
        <div className="health-item">
          <div className="health-label">Stream Quality</div>
          <div className="health-value">{stats.quality.toUpperCase()}</div>
        </div>
      </div>

      {/* Network Info */}
      {networkInfo && (
        <div className="network-info">
          <h4>Network Conditions</h4>
          <div className="network-grid">
            <div className="network-item">
              <span className="network-label">Connection Type:</span>
              <span className="network-value">
                {networkInfo.effectiveType || "Unknown"}
              </span>
            </div>
            <div className="network-item">
              <span className="network-label">Downlink:</span>
              <span className="network-value">
                {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : "N/A"}
              </span>
            </div>
            <div className="network-item">
              <span className="network-label">RTT:</span>
              <span className="network-value">
                {networkInfo.rtt ? `${networkInfo.rtt}ms` : "N/A"}
              </span>
            </div>
            {networkInfo.saveData && (
              <div className="network-item">
                <span className="network-label">⚡ Data Saver:</span>
                <span className="network-value">Active</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="health-recommendations">
        {healthStatus === "excellent" && (
          <p className="recommendation good">
            ✅ Excellent stream quality. Recording at optimal settings.
          </p>
        )}
        {healthStatus === "good" && (
          <p className="recommendation good">
            👍 Good stream quality. Standard recording quality active.
          </p>
        )}
        {healthStatus === "fair" && (
          <p className="recommendation warning">
            ⚠️ Fair stream quality. Consider reducing quality for better stability.
          </p>
        )}
        {healthStatus === "poor" && (
          <p className="recommendation error">
            ❌ Poor stream quality. Please check your network connection or reduce quality.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default StreamHealth;
