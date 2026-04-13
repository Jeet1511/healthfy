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

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isRetryableStatus(status) {
  return [408, 425, 429, 500, 502, 503, 504].includes(Number(status));
}

function parseUploadResult(responseData = {}) {
  const data = responseData?.data || responseData || {};
  return {
    cloudPath: data.cloudPath || data.storagePath || data.path || null,
  };
}

class ChunkUploader {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 2000; // ms
    this.syncIntervalMs = options.syncIntervalMs || 15000;
    this.onProgress = options.onProgress || null;
    this.onError = options.onError || null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    this.boundHandleOnline = () => this.handleOnline();
    this.boundHandleOffline = () => this.handleOffline();

    // Listen for online/offline events
    window.addEventListener("online", this.boundHandleOnline);
    window.addEventListener("offline", this.boundHandleOffline);

    this.syncTimer = window.setInterval(() => {
      if (this.isOnline) {
        this.syncPendingUploads().catch(() => undefined);
      }
    }, this.syncIntervalMs);
  }

  destroy() {
    window.removeEventListener("online", this.boundHandleOnline);
    window.removeEventListener("offline", this.boundHandleOffline);
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }

  getAuthHeaders() {
    try {
      const session = JSON.parse(localStorage.getItem("omina_session") || "null");
      if (session?.token) {
        return { Authorization: `Bearer ${session.token}` };
      }
    } catch {
      // Ignore malformed auth session payload.
    }
    return {};
  }

  /**
   * Upload a chunk to the server
   * If offline, store in IndexedDB and retry when online
   */
  async uploadChunk(blob, metadata) {
    const { sessionId, chunkIndex, timestamp, location, duration } = metadata;

    if (!sessionId) {
      throw new Error("Session ID is required for chunk upload");
    }

    if (chunkIndex == null) {
      throw new Error("Chunk index is required for chunk upload");
    }

    const uploadRecord = {
      sessionId,
      chunkIndex,
      blob,
      timestamp,
      location,
      duration,
      status: UPLOAD_STATUS.PENDING,
      retries: 0,
      createdAt: new Date().toISOString(),
    };

    if (!this.isOnline) {
      await offlineStorageService.saveChunkForUpload(uploadRecord);
      this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.PENDING);
      return {
        success: false,
        queued: true,
        offline: true,
        chunkIndex,
      };
    }

    return this.performUpload(uploadRecord);
  }

  /**
   * Build multipart payload for upload.
   */
  buildFormData(uploadRecord, fileFieldName = "video") {
    const { sessionId, chunkIndex, blob, location, duration } = uploadRecord;

    const formData = new FormData();
    formData.append(fileFieldName, blob, `chunk-${chunkIndex}.webm`);
    formData.append("sessionId", sessionId);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("duration", String(duration || 0));
    formData.append("location", JSON.stringify(location || {}));
    formData.append("reason", "realtime-chunk");

    return formData;
  }

  async postToEndpoint(uploadRecord, endpoint) {
    const response = await this.apiClient.post(
      endpoint.path,
      this.buildFormData(uploadRecord, endpoint.fileFieldName),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...this.getAuthHeaders(),
        },
      }
    );

    return parseUploadResult(response.data);
  }

  async uploadWithCompatibility(uploadRecord) {
    const endpoints = [
      { path: "/upload-video", fileFieldName: "video" },
      { path: "/evidence/upload-chunk", fileFieldName: "chunk" },
    ];

    let lastError = null;

    for (let i = 0; i < endpoints.length; i += 1) {
      const endpoint = endpoints[i];
      try {
        return await this.postToEndpoint(uploadRecord, endpoint);
      } catch (error) {
        lastError = error;
        const status = Number(error?.response?.status || 0);
        const canFallback = [404, 405, 415].includes(status) && i < endpoints.length - 1;
        if (canFallback) {
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error("Upload failed");
  }

  shouldQueueForLater(error) {
    if (!navigator.onLine || !this.isOnline) {
      return true;
    }

    const status = Number(error?.response?.status || 0);
    return !status || isRetryableStatus(status);
  }

  /**
   * Perform upload with retry/backoff. Falls back to offline queue when needed.
   */
  performUpload = async (uploadRecord) => {
    const { sessionId, chunkIndex } = uploadRecord;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      if (!this.isOnline) {
        await offlineStorageService.saveChunkForUpload(uploadRecord);
        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.PENDING);
        return {
          success: false,
          queued: true,
          offline: true,
          chunkIndex,
        };
      }

      this.notifyProgress(
        sessionId,
        chunkIndex,
        attempt === 0 ? UPLOAD_STATUS.UPLOADING : UPLOAD_STATUS.RETRYING
      );

      try {
        const uploadResult = await this.uploadWithCompatibility(uploadRecord);

        uploadRecord.status = UPLOAD_STATUS.SUCCESS;
        uploadRecord.cloudPath = uploadResult.cloudPath;
        uploadRecord.uploadedAt = new Date().toISOString();

        await offlineStorageService.saveUploadedChunk(uploadRecord);
        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.SUCCESS);

        return {
          success: true,
          chunkIndex,
          cloudPath: uploadResult.cloudPath,
        };
      } catch (error) {
        const status = Number(error?.response?.status || 0);
        const retryable = !status || isRetryableStatus(status);
        const shouldQueue = this.shouldQueueForLater(error);

        if (attempt < this.maxRetries && retryable) {
          const delay = Math.min(this.retryDelay * Math.pow(2, attempt), 30000);
          await wait(delay);
          continue;
        }

        uploadRecord.retries = attempt + 1;

        if (shouldQueue) {
          uploadRecord.status = UPLOAD_STATUS.PENDING;
          await offlineStorageService.saveChunkForUpload(uploadRecord);
          this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.PENDING);

          return {
            success: false,
            queued: true,
            offline: !navigator.onLine,
            chunkIndex,
            error: error?.message || "Upload queued for retry",
          };
        }

        uploadRecord.status = UPLOAD_STATUS.FAILED;
        await offlineStorageService.saveFailedChunk(uploadRecord);
        this.notifyProgress(sessionId, chunkIndex, UPLOAD_STATUS.FAILED);
        this.onError?.(error);

        return {
          success: false,
          chunkIndex,
          error: error?.message || "Upload failed",
        };
      }
    }

    return {
      success: false,
      chunkIndex,
      error: "Upload failed after retries",
    };
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
    return this.performUpload(failedChunk);
  }

  /**
   * Sync all pending uploads when online
   */
  async syncPendingUploads(sessionId = null) {
    if (!this.isOnline || this.syncInProgress) {
      return { successful: 0, failed: 0, queued: 0, total: 0 };
    }

    this.syncInProgress = true;

    try {
      const pendingChunks = await offlineStorageService.getPendingChunks(sessionId);

      if (pendingChunks.length === 0) {
        return { successful: 0, failed: 0, queued: 0, total: 0 };
      }

      const sortedChunks = [...pendingChunks].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();

        if (a.sessionId !== b.sessionId) {
          return String(a.sessionId).localeCompare(String(b.sessionId));
        }
        if (aTime !== bTime) {
          return aTime - bTime;
        }
        return Number(a.chunkIndex || 0) - Number(b.chunkIndex || 0);
      });

      let successful = 0;
      let failed = 0;
      let queued = 0;

      for (const chunk of sortedChunks) {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.performUpload({
          ...chunk,
          status: UPLOAD_STATUS.PENDING,
          retries: Number(chunk.retries || 0),
        });

        if (result.success) {
          successful += 1;
        } else if (result.queued) {
          queued += 1;
        } else {
          failed += 1;
        }
      }

      return {
        successful,
        failed,
        queued,
        total: sortedChunks.length,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Handle online event
   */
  handleOnline = async () => {
    this.isOnline = true;
    this.notifyProgress("system", -1, UPLOAD_STATUS.RETRYING);
    await this.syncPendingUploads();
  };

  /**
   * Handle offline event
   */
  handleOffline = () => {
    this.isOnline = false;
    this.notifyProgress("system", -1, UPLOAD_STATUS.PENDING);
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
