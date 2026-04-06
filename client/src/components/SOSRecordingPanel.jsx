import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { EvidenceRecorder, RECORDING_STATUS, RECORDING_TYPE } from "../services/recordingService.js";
import createChunkUploader from "../services/chunkUploaderService.js";
import { permissionHandler, PERMISSION_STATUS, PERMISSION_TYPES } from "../services/permissionService.js";
import { offlineStorageService } from "../services/offlineStorageService.js";
import "./SOSRecordingPanel.css";

/**
 * SOS Recording Panel Component
 * Main component for emergency recording with real-time uploads
 */
function SOSRecordingPanel() {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(RECORDING_STATUS.IDLE);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Permissions state
  const [permissions, setPermissions] = useState({
    [PERMISSION_TYPES.CAMERA]: PERMISSION_STATUS.PROMPT,
    [PERMISSION_TYPES.MICROPHONE]: PERMISSION_STATUS.PROMPT,
    [PERMISSION_TYPES.LOCATION]: PERMISSION_STATUS.PROMPT,
    [PERMISSION_TYPES.NOTIFICATIONS]: PERMISSION_STATUS.PROMPT,
  });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Recording config
  const [recordingType, setRecordingType] = useState(RECORDING_TYPE.AUDIO_VIDEO);
  const [cameraFacing, setCameraFacing] = useState("user");

  // Upload state
  const [uploadStats, setUploadStats] = useState({
    uploadedChunks: 0,
    pendingChunks: 0,
    failedChunks: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Location state
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // UI state
  const [showStats, setShowStats] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Refs
  const recorderRef = useRef(null);
  const uploaderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const locationIntervalRef = useRef(null);

  /**
   * Initialize on component mount
   */
  useEffect(() => {
    initializeServices();
    setupEventListeners();

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Initialize services
   */
  const initializeServices = async () => {
    try {
      // Initialize offline storage
      await offlineStorageService.initialize();

      // Check initial permissions
      await checkPermissions();

      // Setup online/offline listeners
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    } catch (error) {
      console.error("Initialization error:", error);
      setErrorMessage("Failed to initialize recording system");
    }
  };

  /**
   * Setup event listeners
   */
  const setupEventListeners = () => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  };

  /**
   * Cleanup
   */
  const cleanup = () => {
    if (recorderRef.current) {
      recorderRef.current.cleanup();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };

  /**
   * Check and request all permissions
   */
  const checkPermissions = async () => {
    try {
      const perms = await permissionHandler.requestAllPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error("Permission check error:", error);
    }
  };

  /**
   * Request specific permission
   */
  const requestPermission = async (type) => {
    try {
      let status;
      switch (type) {
        case PERMISSION_TYPES.CAMERA:
          status = await permissionHandler.requestCamera();
          break;
        case PERMISSION_TYPES.MICROPHONE:
          status = await permissionHandler.requestMicrophone();
          break;
        case PERMISSION_TYPES.LOCATION:
          status = await permissionHandler.requestLocation();
          break;
        case PERMISSION_TYPES.NOTIFICATIONS:
          status = await permissionHandler.requestNotifications();
          break;
        default:
          return;
      }
      setPermissions((prev) => ({ ...prev, [type]: status }));
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
      setErrorMessage(`Failed to request ${type} permission`);
    }
  };

  /**
   * Start location tracking
   */
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        (error) => {
          console.warn("Location error:", error);
          setLocationError(error.message);
        }
      );
    }, 5000); // Update every 5 seconds
  };

  /**
   * Stop location tracking
   */
  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  /**
   * Start recording
   */
  const startRecording = async () => {
    try {
      setErrorMessage(null);

      // Check critical permissions
      if (!permissionHandler.isReadyForRecording()) {
        setShowPermissionDialog(true);
        throw new Error("Camera or microphone permission required");
      }

      // Create chunk uploader
      uploaderRef.current = createChunkUploader(axios, {
        maxRetries: 5,
        retryDelay: 2000,
        onProgress: handleUploadProgress,
        onError: (error) => {
          console.error("Upload error:", error);
        },
      });

      // Create session on server
      const sessionResponse = await axios.post("/api/evidence/start", {
        recordingType,
        metadata: {
          deviceInfo: navigator.userAgent,
          initialLocation: location,
        },
      });

      const newSessionId = sessionResponse.data.data.sessionId;
      setSessionId(newSessionId);

      // Save session to offline storage
      await offlineStorageService.saveSession({
        sessionId: newSessionId,
        userId: "current_user", // Get from context
        startTime: new Date(),
        recordingType,
        metadata: { deviceInfo: navigator.userAgent },
      });

      // Create recorder
      recorderRef.current = new EvidenceRecorder({
        recordingType,
        chunkDuration: 2000,
        onChunkReady: handleChunkReady,
        onStatusChange: handleStatusChange,
        onError: (error) => {
          setErrorMessage(`Recording error: ${error.message}`);
        },
      });

      // Start recorder
      const recordingStarted = await recorderRef.current.start(newSessionId);
      if (!recordingStarted) {
        throw new Error("Failed to start recording");
      }

      setIsRecording(true);

      // Start location tracking
      if (permissions[PERMISSION_TYPES.LOCATION] === PERMISSION_STATUS.GRANTED) {
        startLocationTracking();
      }

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Send notification
      if (permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED) {
        new Notification("🚨 Emergency Recording Started", {
          body: "Your evidence is being recorded and uploaded to the cloud",
          icon: "🔴",
          tag: "sos-recording",
          requireInteraction: true,
        });
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      setErrorMessage(error.message);
      setIsRecording(false);
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = async () => {
    try {
      if (!recorderRef.current || !sessionId) {
        return;
      }

      // Stop location tracking
      stopLocationTracking();

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Stop recorder
      const result = await recorderRef.current.stop();

      // Complete session on server
      await axios.post(`/api/evidence/complete/${sessionId}`, {
        notes: "",
      });

      setIsRecording(false);
      setRecordingTime(0);

      // Sync any offline chunks
      if (uploaderRef.current) {
        const stats = await uploaderRef.current.syncPendingUploads();
        console.log("Sync complete:", stats);
      }

      // Show success notification
      if (permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED) {
        new Notification("✅ Emergency Recording Completed", {
          body: `Recording saved with ${result?.totalChunks || 0} chunks`,
          icon: "✓",
          tag: "sos-recording",
        });
      }

      alert(`Recording completed! Total chunks: ${result?.totalChunks || 0}`);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setErrorMessage(error.message);
    }
  };

  /**
   * Handle chunk ready for upload
   */
  const handleChunkReady = async (chunkData) => {
    try {
      if (!uploaderRef.current || !sessionId) {
        return;
      }

      const uploadResult = await uploaderRef.current.uploadChunk(chunkData.blob, {
        sessionId,
        chunkIndex: chunkData.chunkIndex,
        timestamp: chunkData.timestamp,
        location,
        duration: chunkData.duration,
      });

      if (uploadResult.success) {
        recorderRef.current.markChunkUploaded(chunkData.chunkIndex);
      }
    } catch (error) {
      console.error("Chunk upload error:", error);
    }
  };

  /**
   * Handle upload progress
   */
  const handleUploadProgress = async (progress) => {
    if (sessionId) {
      const stats = await uploaderRef.current.getSessionStats(sessionId);
      setUploadStats({
        uploadedChunks: stats.uploaded,
        pendingChunks: stats.pending,
        failedChunks: stats.failed,
      });
    }
  };

  /**
   * Handle status change
   */
  const handleStatusChange = (status) => {
    setRecordingStatus(status);
  };

  /**
   * Handle online event
   */
  const handleOnline = () => {
    setIsOnline(true);
    if (uploaderRef.current) {
      uploaderRef.current.syncPendingUploads();
    }
  };

  /**
   * Handle offline event
   */
  const handleOffline = () => {
    setIsOnline(false);
  };

  /**
   * Format recording time
   */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="sos-recording-panel">
      {/* Status Bar */}
      <div className={`status-bar ${recordingStatus}`}>
        <div className="status-indicator">
          {isRecording && <span className="pulse-dot"></span>}
          <span className="status-text">
            {isRecording ? "🔴 Recording" : "⚪ Ready"}
          </span>
        </div>
        <div className="connection-indicator">
          {isOnline ? (
            <span className="online">🟢 Online</span>
          ) : (
            <span className="offline">🔴 Offline (syncing...)</span>
          )}
        </div>
      </div>

      {/* Main Recording Controls */}
      <div className="recording-controls">
        <div className="timer-display">
          {isRecording ? (
            <>
              <div className="timer">{formatTime(recordingTime)}</div>
              <div className="chunks-info">
                ✓ {uploadStats.uploadedChunks} | ⟳ {uploadStats.pendingChunks} | ✗{" "}
                {uploadStats.failedChunks}
              </div>
            </>
          ) : (
            <div className="standby-message">
              Ready to record emergency evidence
            </div>
          )}
        </div>

        <div className="button-group">
          {!isRecording ? (
            <button className="btn btn-record" onClick={startRecording}>
              🚨 START RECORDING
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopRecording}>
              ⏹ STOP RECORDING
            </button>
          )}
        </div>
      </div>

      {/* Location Information */}
      {location && (
        <div className="location-info">
          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          {location.accuracy && (
            <span className="accuracy">
              (±{location.accuracy.toFixed(0)}m)
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-banner">
          ⚠️ {errorMessage}{" "}
          <button onClick={() => setErrorMessage(null)}>✕</button>
        </div>
      )}

      {/* Permissions Section */}
      <div className="permissions-section">
        <div className="section-header" onClick={() => setShowPermissionDialog(!showPermissionDialog)}>
          <span>🔒 Permissions</span>
          <span className="toggle">{showPermissionDialog ? "▼" : "▶"}</span>
        </div>

        {showPermissionDialog && (
          <div className="permissions-grid">
            {Object.entries(permissions).map(([type, status]) => (
              <div key={type} className={`permission-item ${status}`}>
                <div className="permission-info">
                  <span className="permission-name">{type}</span>
                  <span className="permission-status">
                    {status === PERMISSION_STATUS.GRANTED && "✓ Granted"}
                    {status === PERMISSION_STATUS.DENIED && "✗ Denied"}
                    {status === PERMISSION_STATUS.PROMPT && "? Pending"}
                  </span>
                </div>
                {status === PERMISSION_STATUS.PROMPT && (
                  <button
                    className="btn-request"
                    onClick={() => requestPermission(type)}
                  >
                    Request
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="advanced-section">
        <div className="section-header" onClick={() => setShowAdvanced(!showAdvanced)}>
          <span>⚙️ Advanced Settings</span>
          <span className="toggle">{showAdvanced ? "▼" : "▶"}</span>
        </div>

        {showAdvanced && !isRecording && (
          <div className="advanced-options">
            <div className="option">
              <label>Recording Type:</label>
              <select
                value={recordingType}
                onChange={(e) => setRecordingType(e.target.value)}
              >
                <option value={RECORDING_TYPE.AUDIO_VIDEO}>
                  Audio + Video
                </option>
                <option value={RECORDING_TYPE.AUDIO_ONLY}>Audio Only</option>
              </select>
            </div>

            <div className="option">
              <label>Camera Facing:</label>
              <select
                value={cameraFacing}
                onChange={(e) => setCameraFacing(e.target.value)}
              >
                <option value="user">Front Camera</option>
                <option value="environment">Back Camera</option>
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? "Hide Stats" : "Show Stats"}
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Session ID:</span>
            <code>{sessionId || "N/A"}</code>
          </div>
          <div className="stat-item">
            <span className="stat-label">Recording Type:</span>
            <span>{recordingType}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Chunks:</span>
            <span>{uploadStats.uploadedChunks + uploadStats.pendingChunks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Upload Success:</span>
            <span>{uploadStats.uploadedChunks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span>{uploadStats.pendingChunks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Failed:</span>
            <span>{uploadStats.failedChunks}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SOSRecordingPanel;
