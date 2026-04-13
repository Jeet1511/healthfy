/**
 * Advanced Media Dashboard Component
 * Unified dashboard for multimedia recording, tracking, and live monitoring
 * Integrates video, audio, location, and permission management
 * WCAG 2.1 AA compliant with mobile-first design
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mediaStreamManager, CAMERA_FACING, STREAM_STATUS } from "../services/mediaStreamManager";
import { geolocationTracker, TRACKING_STATUS } from "../services/geolocationTracker";
import { permissionOrchestrator, PERMISSION_STATUS, PERMISSION_TYPES } from "../services/permissionOrchestrator";
import { liveStreamingService, ENCODING_STATUS, STREAM_QUALITY } from "../services/liveStreamingService";
import PermissionDialog from "./PermissionDialog";
import RecordingIndicator from "./RecordingIndicator";
import LiveVideoFeed from "./LiveVideoFeed";
import LiveMapIntegration from "./LiveMapIntegration";
import StreamHealth from "./StreamHealth";
import "./MediaDashboard.css";

/**
 * Advanced Media Dashboard
 */
function MediaDashboard() {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Stream states
  const [streams, setStreams] = useState([]);
  const [primaryStreamId, setPrimaryStreamId] = useState(null);
  const [cameraFacing, setCameraFacing] = useState(CAMERA_FACING.USER);
  const [streamStatus, setStreamStatus] = useState(STREAM_STATUS.INITIALIZED);

  // Permission states
  const [permissions, setPermissions] = useState({});
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingPermission, setPendingPermission] = useState(null);

  // Location tracking
  const [location, setLocation] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState(TRACKING_STATUS.STOPPED);
  const [locationHistory, setLocationHistory] = useState([]);

  // Streaming state
  const [streamingStats, setStreamingStats] = useState(null);
  const [streamQuality, setStreamQuality] = useState(STREAM_QUALITY.MEDIUM);
  const [encodingStatus, setEncodingStatus] = useState(ENCODING_STATUS.IDLE);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const timerIntervalRef = useRef(null);
  const mediaStreamManagerRef = useRef(null);
  const geolocationTrackerRef = useRef(null);
  const liveStreamingServiceRef = useRef(null);

  /**
   * Initialize on component mount
   */
  useEffect(() => {
    initializeServices();
    return () => cleanup();
  }, []);

  /**
   * Initialize all services
   */
  const initializeServices = async () => {
    try {
      // Initialize media stream manager
      mediaStreamManagerRef.current = mediaStreamManager;
      await mediaStreamManager.initialize();

      // Initialize permission orchestrator
      await permissionOrchestrator.initialize();
      setPermissions(permissionOrchestrator.getPermissionStatus());

      // Initialize live streaming service
      liveStreamingServiceRef.current = liveStreamingService;

      // Initialize geolocation tracker
      geolocationTrackerRef.current = geolocationTracker;

      // Setup event listeners
      mediaStreamManager.onStatusChange((status) => {
        setStreamStatus(status.status);
      });

      geolocationTracker.onStatusChange((status) => {
        setTrackingStatus(status.status);
      });

      geolocationTracker.onLocationUpdate((loc) => {
        setLocation(loc);
        setLocationHistory((prev) => [...prev.slice(-99), loc]);
      });

      liveStreamingService.onStatusChange((status) => {
        setEncodingStatus(status.status);
      });

      liveStreamingService.onStatsUpdate((stats) => {
        setStreamingStats(stats);
      });

      // Check permissions that need explicit request
      if (
        permissionOrchestrator.getPermissionStatus(PERMISSION_TYPES.CAMERA) ===
        PERMISSION_STATUS.PROMPT
      ) {
        setPendingPermission(PERMISSION_TYPES.CAMERA);
        setShowPermissionDialog(true);
      }
    } catch (err) {
      setError(`Initialization failed: ${err.message}`);
      console.error("Initialization error:", err);
    }
  };

  /**
   * Start recording with all media streams
   */
  const startRecording = async () => {
    try {
      setError(null);

      // Generate session ID
      const newSessionId = `session-${Date.now()}`;
      setSessionId(newSessionId);

      // Request front camera
      const cameraStream = await mediaStreamManager.requestStream(
        `camera-${newSessionId}`,
        {
          audio: true,
          video: true,
          facing: CAMERA_FACING.USER,
          quality: "medium",
        }
      );

      setPrimaryStreamId(cameraStream.id);
      setStreams([cameraStream]);

      // Start live streaming
      const mainStream = cameraStream.stream;
      await liveStreamingService.startStreaming(mainStream, {
        quality: streamQuality,
        onChunk: (chunk) => {
          console.log("Stream chunk:", chunk.size, "bytes");
        },
        onStats: (stats) => {
          setStreamingStats(stats);
        },
      });

      // Start geolocation tracking
      await geolocationTracker.startTracking({
        enableHigh: true,
        updateInterval: 2000,
      });

      // Start recording timer
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      setIsRecording(true);
    } catch (err) {
      setError(`Failed to start recording: ${err.message}`);
      console.error("Recording start error:", err);
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = async () => {
    try {
      setIsRecording(false);

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Stop all streams
      await mediaStreamManager.stopAllStreams();
      setStreams([]);

      // Stop streaming
      const result = liveStreamingService.stopStreaming();
      console.log("Recording stopped:", result);

      // Stop location tracking
      geolocationTracker.stopTracking();
      setTrackingStatus(TRACKING_STATUS.STOPPED);

      setRecordingTime(0);
      setSessionId(null);
    } catch (err) {
      setError(`Failed to stop recording: ${err.message}`);
      console.error("Recording stop error:", err);
    }
  };

  /**
   * Request camera permission
   */
  const requestCameraPermission = async () => {
    try {
      const status = await permissionOrchestrator.requestCamera(true);
      setPermissions((prev) => ({
        ...prev,
        [PERMISSION_TYPES.CAMERA]: status,
      }));
      setPendingPermission(null);
      setShowPermissionDialog(false);

      if (status === PERMISSION_STATUS.GRANTED) {
        // Auto-start recording if permission granted
        await startRecording();
      }
    } catch (err) {
      setError(`Permission request failed: ${err.message}`);
    }
  };

  /**
   * Switch camera (front/rear)
   */
  const switchCamera = async () => {
    try {
      if (!primaryStreamId || !isRecording) return;

      const newFacing =
        cameraFacing === CAMERA_FACING.USER
          ? CAMERA_FACING.ENVIRONMENT
          : CAMERA_FACING.USER;

      const updatedStream = await mediaStreamManager.switchCamera(
        primaryStreamId,
        newFacing
      );

      setCameraFacing(newFacing);

      // Update live streaming
      await liveStreamingService.changeQuality(streamQuality);
    } catch (err) {
      setError(`Failed to switch camera: ${err.message}`);
    }
  };

  /**
   * Change streaming quality
   */
  const changeQuality = async (quality) => {
    try {
      setStreamQuality(quality);
      if (isRecording) {
        await liveStreamingService.changeQuality(quality);
      }
    } catch (err) {
      setError(`Failed to change quality: ${err.message}`);
    }
  };

  /**
   * Format time
   */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Cleanup
   */
  const cleanup = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  return (
    <div className="media-dashboard" role="main" aria-label="Advanced Media Recording Dashboard">
      <div className="dashboard-header">
        <h1>🎬 Live Media Dashboard</h1>
        <p className="subtitle">
          Real-time multimedia recording with GPS tracking
        </p>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-banner"
            role="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button
              onClick={() => setError(null)}
              className="error-close"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <RecordingIndicator
        isRecording={isRecording}
        recordingTime={recordingTime}
        formatTime={formatTime}
      />

      {/* Permission Dialog */}
      <PermissionDialog
        isOpen={showPermissionDialog}
        permissionType={pendingPermission}
        onGranted={requestCameraPermission}
        onDenied={() => setShowPermissionDialog(false)}
      />

      {/* Main Controls */}
      <div className="dashboard-controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`control-btn ${isRecording ? "stop" : "start"}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          disabled={
            permissions[PERMISSION_TYPES.CAMERA] !== PERMISSION_STATUS.GRANTED
          }
          title={
            permissions[PERMISSION_TYPES.CAMERA] !== PERMISSION_STATUS.GRANTED
              ? "Camera permission required"
              : ""
          }
        >
          {isRecording ? (
            <>
              <span className="btn-icon">⏹️</span>
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <span className="btn-icon">🔴</span>
              <span>Start Recording</span>
            </>
          )}
        </button>

        {isRecording && (
          <>
            <button
              onClick={switchCamera}
              className="control-btn secondary"
              aria-label="Switch camera"
              title="Switch between front and rear camera"
            >
              <span className="btn-icon">📸</span>
              <span>
                Switch Camera ({cameraFacing === CAMERA_FACING.USER ? "Front" : "Rear"})
              </span>
            </button>

            <div className="quality-selector">
              <label htmlFor="quality">Streaming Quality:</label>
              <select
                id="quality"
                value={streamQuality}
                onChange={(e) => changeQuality(e.target.value)}
                className="quality-select"
              >
                <option value={STREAM_QUALITY.LOW}>Low (360p)</option>
                <option value={STREAM_QUALITY.MEDIUM}>Medium (720p)</option>
                <option value={STREAM_QUALITY.HIGH}>High (1080p)</option>
                <option value={STREAM_QUALITY.ADAPTIVE}>Adaptive</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Video Feed */}
      {isRecording && primaryStreamId && (
        <div className="video-container">
          <LiveVideoFeed streamId={primaryStreamId} label="Front Camera" />
        </div>
      )}

      {/* Location Map */}
      {isRecording && showMap && location && (
        <div className="map-container">
          <LiveMapIntegration
            currentLocation={location}
            locationHistory={locationHistory}
            onClose={() => setShowMap(false)}
          />
        </div>
      )}

      {/* Stats and Monitor */}
      <div className="dashboard-footer">
        <button
          onClick={() => setShowMap(!showMap)}
          className="footer-btn"
          aria-label={showMap ? "Hide map" : "Show live map"}
          disabled={!location}
        >
          🗺️ {showMap ? "Hide" : "Show"} Map
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className="footer-btn"
          aria-label={showStats ? "Hide stats" : "Show statistics"}
        >
          📊 {showStats ? "Hide" : "Show"} Stats
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="footer-btn"
          aria-label={showAdvanced ? "Hide advanced" : "Show advanced options"}
        >
          ⚙️ {showAdvanced ? "Hide" : "Show"} Advanced
        </button>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && streamingStats && (
          <StreamHealth stats={streamingStats} />
        )}
      </AnimatePresence>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className="advanced-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3>Advanced Options</h3>
            <div className="advanced-options">
              <div className="option-group">
                <label>Permissions:</label>
                <div className="permission-status">
                  {Object.entries(permissions).map(([type, status]) => (
                    <div key={type} className="permission-item">
                      <span className="permission-type">{type}:</span>
                      <span
                        className={`permission-badge ${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Stream Status:</label>
                <div className="status-grid">
                  <span>Stream: {streamStatus}</span>
                  <span>Encoding: {encodingStatus}</span>
                  <span>Location: {trackingStatus}</span>
                </div>
              </div>

              <div className="option-group">
                <label>Session Info:</label>
                <div className="session-info">
                  <p>Session ID: {sessionId || "Not recording"}</p>
                  <p>Recording Time: {formatTime(recordingTime)}</p>
                  <p>Active Streams: {streams.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MediaDashboard;
