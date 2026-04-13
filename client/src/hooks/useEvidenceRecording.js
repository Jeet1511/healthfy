import { useState, useCallback } from "react";
import { EvidenceRecorder, RECORDING_STATUS } from "../services/recordingService.js";
import createChunkUploader from "../services/chunkUploaderService.js";
import { permissionHandler } from "../services/permissionService.js";
import { offlineStorageService } from "../services/offlineStorageService.js";
import axios from "axios";

/**
 * useEvidenceRecording Hook
 * Complete hook for managing emergency recording sessions
 */
export const useEvidenceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    uploadedChunks: 0,
    pendingChunks: 0,
    failedChunks: 0,
  });
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // Refs (using state values in actual implementation)
  let recorderRef = null;
  let uploaderRef = null;
  let timerRef = null;
  let locationRef = null;

  /**
   * Start emergency recording
   */
  const startRecording = useCallback(async (recordingType = "audio-video") => {
    try {
      setError(null);

      // Check permissions
      if (!permissionHandler.isReadyForRecording()) {
        throw new Error("Camera or microphone permission required");
      }

      // Initialize offline storage
      await offlineStorageService.initialize();

      // Create session
      const sessionResponse = await axios.post("/api/evidence/start", {
        recordingType,
        metadata: {
          deviceInfo: navigator.userAgent,
        },
      });

      const newSessionId = sessionResponse.data.data.sessionId;
      setSessionId(newSessionId);

      // Save to offline storage
      await offlineStorageService.saveSession({
        sessionId: newSessionId,
        userId: "current_user",
        startTime: new Date(),
        recordingType,
      });

      // Create uploader
      uploaderRef = createChunkUploader(axios, {
        maxRetries: 5,
        retryDelay: 2000,
        onProgress: async () => {
          if (uploaderRef && newSessionId) {
            const stats = await uploaderRef.getSessionStats(newSessionId);
            setUploadStats({
              uploadedChunks: stats.uploaded,
              pendingChunks: stats.pending,
              failedChunks: stats.failed,
            });
          }
        },
      });

      // Create recorder
      recorderRef = new EvidenceRecorder({
        recordingType,
        chunkDuration: 2000,
        onChunkReady: async (chunkData) => {
          if (uploaderRef && newSessionId) {
            const result = await uploaderRef.uploadChunk(chunkData.blob, {
              sessionId: newSessionId,
              chunkIndex: chunkData.chunkIndex,
              timestamp: chunkData.timestamp,
              location,
              duration: chunkData.duration,
            });

            if (result.success && recorderRef) {
              recorderRef.markChunkUploaded(chunkData.chunkIndex);
            }
          }
        },
      });

      // Start recording
      const started = await recorderRef.start(newSessionId);
      if (!started) {
        throw new Error("Failed to start recording");
      }

      setIsRecording(true);

      // Start location tracking
      if (navigator.geolocation) {
        locationRef = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          });
        }, 5000);
      }

      // Start timer
      timerRef = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return newSessionId;
    } catch (err) {
      console.error("Recording start error:", err);
      setError(err.message);
      throw err;
    }
  }, [location]);

  /**
   * Stop emergency recording
   */
  const stopRecording = useCallback(async () => {
    try {
      if (!recorderRef || !sessionId) {
        throw new Error("No active recording");
      }

      // Stop tracking
      if (timerRef) clearInterval(timerRef);
      if (locationRef) clearInterval(locationRef);

      // Stop recorder
      const result = await recorderRef.stop();

      // Complete session
      await axios.post(`/api/evidence/complete/${sessionId}`, { notes: "" });

      // Sync pending uploads
      if (uploaderRef) {
        await uploaderRef.syncPendingUploads();
      }

      // Reset state
      setIsRecording(false);
      setRecordingTime(0);
      setSessionId(null);

      return result;
    } catch (err) {
      console.error("Recording stop error:", err);
      setError(err.message);
      throw err;
    }
  }, [sessionId]);

  /**
   * Get recorder stats
   */
  const getStats = useCallback(() => {
    return {
      isRecording,
      sessionId,
      recordingTime,
      uploadStats,
      location,
      error,
    };
  }, [isRecording, sessionId, recordingTime, uploadStats, location, error]);

  return {
    isRecording,
    sessionId,
    recordingTime,
    uploadStats,
    location,
    error,
    startRecording,
    stopRecording,
    getStats,
  };
};

/**
 * Usage Example in Component:
 *
 * function MyComponent() {
 *   const {
 *     isRecording,
 *     recordingTime,
 *     uploadStats,
 *     startRecording,
 *     stopRecording,
 *   } = useEvidenceRecording();
 *
 *   return (
 *     <div>
 *       {isRecording ? (
 *         <>
 *           <p>Recording: {recordingTime}s</p>
 *           <p>Uploaded: {uploadStats.uploadedChunks}</p>
 *           <button onClick={stopRecording}>Stop</button>
 *         </>
 *       ) : (
 *         <button onClick={() => startRecording('audio-video')}>
 *           Start SOS
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */

export default useEvidenceRecording;
