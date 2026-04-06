/**
 * Chunk Uploader Service
 * Handles real-time chunk upload with offline caching and retry logic
 */

import { offlineStorageService } from "./offlineStorageService.js";

export const UPLOAD_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  SUCCESS: "success",
  FAILED: "failed",
  RETRYING: "retrying",
};

class ChunkUploader {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.uploads = new Map(); // sessionId -> array of uploads
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 2000; // ms
    this.onProgress = options.onProgress || null;
    this.onError = options.onError || null;
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  /**
   * Upload a chunk to the server
   * If offline, store in IndexedDB and retry when online
   */
  async uploadChunk(blob, metadata) {
    const { sessionId, chunkIndex, timestamp, location, duration } = metadata;

    const uploadRecord = {
      sessionId,
      chunkIndex,
      blob,
      timestamp,
      location,
      duration,
      status: UPLOAD_STATUS.PENDING,
      retries: 0,
      createdAt: new Date(),
    };

    try {
      if (!this.isOnline) {
        // Store offline
        await offlineStorageService.saveChunkForUpload(uploadRecord);
        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.PENDING);
        return {
          success: false,
          offline: true,
          chunkIndex,
        };
      }

      // Upload immediately
      return await this.performUpload(uploadRecord);
    } catch (error) {
      console.error("Chunk upload error:", error);
      // Save for offline retry
      await offlineStorageService.saveChunkForUpload(uploadRecord);
      this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.FAILED);
      return {
        success: false,
        error: error.message,
        chunkIndex,
      };
    }
  }

  /**
   * Perform actual upload
   */
  performUpload = async (uploadRecord) => {
    const { sessionId, chunkIndex, blob, location, duration } = uploadRecord;

    this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.UPLOADING);

    const formData = new FormData();
    formData.append("chunk", blob, `chunk-${chunkIndex}.webm`);
    formData.append("sessionId", sessionId);
    formData.append("chunkIndex", chunkIndex);
    formData.append("duration", duration);
    formData.append("location", JSON.stringify(location));

    try {
      const response = await this.apiClient.post("/evidence/upload-chunk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      uploadRecord.status = UPLOAD_STATUS.SUCCESS;
      uploadRecord.cloudPath = response.data.data.cloudPath;

      // Save successful upload
      await offlineStorageService.saveUploadedChunk(uploadRecord);

      this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.SUCCESS);

      return {
        success: true,
        chunkIndex,
        cloudPath: response.data.data.cloudPath,
      };
    } catch (error) {
      uploadRecord.retries++;

      if (uploadRecord.retries < this.maxRetries) {
        uploadRecord.status = UPLOAD_STATUS.RETRYING;

        // Schedule retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, uploadRecord.retries - 1);
        setTimeout(() => this.performUpload(uploadRecord), delay);

        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.RETRYING);
      } else {
        uploadRecord.status = UPLOAD_STATUS.FAILED;
        await offlineStorageService.saveFailedChunk(uploadRecord);
        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.FAILED);
      }

      throw error;
    }
  };

  /**
   * Retry failed chunk uploads
   */
  async retryFailedChunk(sessionId, chunkIndex) {
    const failedChunk = await offlineStorageService.getFailedChunk(sessionId, chunkIndex);

    if (!failedChunk) {
      throw new Error("Chunk not found");
    }

    failedChunk.retries = 0;
    failedChunk.status = UPLOAD_STATUS.RETRYING;

    try {
      return await this.performUpload(failedChunk);
    } catch (error) {
      console.error("Retry failed:", error);
      throw error;
    }
  }

  /**
   * Sync all pending uploads when online
   */
  async syncPendingUploads() {
    if (!this.isOnline) {
      console.warn("Still offline, cannot sync");
      return;
    }

    const pendingChunks = await offlineStorageService.getPendingChunks();

    if (pendingChunks.length === 0) {
      console.log("No pending uploads to sync");
      return;
    }

    console.log(`Syncing ${pendingChunks.length} pending chunks...`);

    const results = await Promise.allSettled(
      pendingChunks.map((chunk) => this.performUpload(chunk))
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    console.log(`Synced: ${successful}/${pendingChunks.length} chunks`);

    return { successful, total: pendingChunks.length };
  }

  /**
   * Handle online event
   */
  handleOnline = async () => {
    this.isOnline = true;
    console.log("Connection restored, syncing pending uploads...");
    await this.syncPendingUploads();
  };

  /**
   * Handle offline event
   */
  handleOffline = () => {
    this.isOnline = false;
    console.log("Connection lost, future uploads will be queued");
  };

  /**
   * Notify progress to listeners
   */
  notifyProgress(sessionId, chunkIndex, status) {
    if (this.onProgress) {
      this.onProgress({
        sessionId,
        chunkIndex,
        status,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get upload stats for session
   */
  async getSessionStats(sessionId) {
    const uploaded = await offlineStorageService.getUploadedChunks(sessionId);
    const pending = await offlineStorageService.getPendingChunks(sessionId);
    const failed = await offlineStorageService.getFailedChunks(sessionId);

    return {
      sessionId,
      uploaded: uploaded.length,
      pending: pending.length,
      failed: failed.length,
      total: uploaded.length + pending.length + failed.length,
    };
  }

  /**
   * Clear session data from offline storage
   */
  async clearSession(sessionId) {
    await offlineStorageService.clearSession(sessionId);
  }
}

// Create singleton
const createChunkUploader = (apiClient, options) => {
  return new ChunkUploader(apiClient, options);
};

export default createChunkUploader;
