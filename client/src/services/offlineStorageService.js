/**
 * Offline Storage Service
 * Uses IndexedDB for persistent offline caching of recording chunks
 */

const DB_NAME = "OMINA_Evidence";
const DB_VERSION = 2;
const STORES = {
  PENDING_CHUNKS: "pendingChunks",
  UPLOADED_CHUNKS: "uploadedChunks",
  FAILED_CHUNKS: "failedChunks",
  SESSIONS: "sessions",
};

class OfflineStorageService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize IndexedDB
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.PENDING_CHUNKS)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_CHUNKS, {
            keyPath: ["sessionId", "chunkIndex"],
          });
          pendingStore.createIndex("sessionId", "sessionId");
          pendingStore.createIndex("createdAt", "createdAt");
        }

        if (!db.objectStoreNames.contains(STORES.UPLOADED_CHUNKS)) {
          const uploadedStore = db.createObjectStore(STORES.UPLOADED_CHUNKS, {
            keyPath: ["sessionId", "chunkIndex"],
          });
          uploadedStore.createIndex("sessionId", "sessionId");
          uploadedStore.createIndex("uploadedAt", "uploadedAt");
        }

        if (!db.objectStoreNames.contains(STORES.FAILED_CHUNKS)) {
          const failedStore = db.createObjectStore(STORES.FAILED_CHUNKS, {
            keyPath: ["sessionId", "chunkIndex"],
          });
          failedStore.createIndex("sessionId", "sessionId");
          failedStore.createIndex("failedAt", "failedAt");
        }

        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionsStore = db.createObjectStore(STORES.SESSIONS, {
            keyPath: "sessionId",
          });
          sessionsStore.createIndex("userId", "userId");
        }
      };
    });
  }

  /**
   * Save chunk for pending upload
   */
  async saveChunkForUpload(chunk) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_CHUNKS], "readwrite");
      const store = transaction.objectStore(STORES.PENDING_CHUNKS);

      const chunkData = {
        sessionId: chunk.sessionId,
        chunkIndex: chunk.chunkIndex,
        blob: chunk.blob,
        timestamp: chunk.timestamp,
        location: chunk.location,
        duration: chunk.duration,
        retries: chunk.retries || 0,
        createdAt: new Date().toISOString(),
      };

      const request = store.put(chunkData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(chunkData);
    });
  }

  /**
   * Get all pending chunks for upload
   */
  async getPendingChunks(sessionId = null) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_CHUNKS], "readonly");
      const store = transaction.objectStore(STORES.PENDING_CHUNKS);

      let request;
      if (sessionId) {
        const index = store.index("sessionId");
        request = index.getAll(sessionId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Save successfully uploaded chunk
   */
  async saveUploadedChunk(chunk) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [STORES.UPLOADED_CHUNKS, STORES.PENDING_CHUNKS, STORES.FAILED_CHUNKS],
        "readwrite"
      );

      const uploadedStore = transaction.objectStore(STORES.UPLOADED_CHUNKS);
      const pendingStore = transaction.objectStore(STORES.PENDING_CHUNKS);
      const failedStore = transaction.objectStore(STORES.FAILED_CHUNKS);

      const uploadedData = {
        sessionId: chunk.sessionId,
        chunkIndex: chunk.chunkIndex,
        cloudPath: chunk.cloudPath,
        uploadedAt: new Date().toISOString(),
      };

      uploadedStore.put(uploadedData);

      // Remove from pending
      const key = [chunk.sessionId, chunk.chunkIndex];
      pendingStore.delete(key);
      failedStore.delete(key);

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve(uploadedData);
    });
  }

  /**
   * Get uploaded chunks for a session
   */
  async getUploadedChunks(sessionId) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.UPLOADED_CHUNKS], "readonly");
      const store = transaction.objectStore(STORES.UPLOADED_CHUNKS);
      let request;

      if (sessionId) {
        const index = store.index("sessionId");
        request = index.getAll(sessionId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Save failed chunk
   */
  async saveFailedChunk(chunk) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [STORES.FAILED_CHUNKS, STORES.PENDING_CHUNKS],
        "readwrite"
      );

      const failedStore = transaction.objectStore(STORES.FAILED_CHUNKS);
      const pendingStore = transaction.objectStore(STORES.PENDING_CHUNKS);

      const failedData = {
        sessionId: chunk.sessionId,
        chunkIndex: chunk.chunkIndex,
        blob: chunk.blob,
        timestamp: chunk.timestamp,
        location: chunk.location,
        duration: chunk.duration,
        retries: chunk.retries,
        failedAt: new Date().toISOString(),
      };

      failedStore.put(failedData);

      // Remove from pending
      const key = [chunk.sessionId, chunk.chunkIndex];
      pendingStore.delete(key);

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve(failedData);
    });
  }

  /**
   * Get failed chunks
   */
  async getFailedChunks(sessionId = null) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAILED_CHUNKS], "readonly");
      const store = transaction.objectStore(STORES.FAILED_CHUNKS);

      let request;
      if (sessionId) {
        const index = store.index("sessionId");
        request = index.getAll(sessionId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get specific failed chunk
   */
  async getFailedChunk(sessionId, chunkIndex) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FAILED_CHUNKS], "readonly");
      const store = transaction.objectStore(STORES.FAILED_CHUNKS);

      const request = store.get([sessionId, chunkIndex]);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Save session metadata
   */
  async saveSession(session) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SESSIONS], "readwrite");
      const store = transaction.objectStore(STORES.SESSIONS);

      const sessionData = {
        sessionId: session.sessionId,
        userId: session.userId,
        startTime: session.startTime,
        recordingType: session.recordingType,
        metadata: session.metadata,
        savedAt: new Date().toISOString(),
      };

      const request = store.put(sessionData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(sessionData);
    });
  }

  /**
   * Get session metadata
   */
  async getSession(sessionId) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SESSIONS], "readonly");
      const store = transaction.objectStore(STORES.SESSIONS);

      const request = store.get(sessionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all data for a session
   */
  async clearSession(sessionId) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [STORES.PENDING_CHUNKS, STORES.UPLOADED_CHUNKS, STORES.FAILED_CHUNKS, STORES.SESSIONS],
        "readwrite"
      );

      [STORES.PENDING_CHUNKS, STORES.UPLOADED_CHUNKS, STORES.FAILED_CHUNKS].forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const index = store.index("sessionId");
        const request = index.openCursor(IDBKeyRange.only(sessionId));
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (!cursor) return;
          cursor.delete();
          cursor.continue();
        };
      });

      transaction.objectStore(STORES.SESSIONS).delete(sessionId);

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve(true);
    });
  }

  /**
   * Get database info
   */
  async getInfo() {
    if (!this.db) await this.initialize();

    const pending = await this.getPendingChunks();
    const uploaded = await this.getUploadedChunks();
    const failed = await this.getFailedChunks();

    return {
      pending: pending.length,
      uploaded: uploaded.length,
      failed: failed.length,
      estimatedSize:
        (pending.length + failed.length) * 2 * 1024 * 1024 + uploaded.length * 100 * 1024,
    };
  }
}

// Create singleton
export const offlineStorageService = new OfflineStorageService();

// Initialize on import
offlineStorageService.initialize().catch((err) => {
  console.warn("Failed to initialize IndexedDB:", err);
});
