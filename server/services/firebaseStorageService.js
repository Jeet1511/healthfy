import admin from "firebase-admin";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Firebase Cloud Storage Service
 * Handles secure upload and retrieval of evidence files
 */

class FirebaseStorageService {
  constructor() {
    this.bucket = null;
    this.initialized = false;
    this.localRoot = path.join(process.cwd(), "local-evidence-storage");
  }

  normalizeStoragePath(storagePath) {
    return String(storagePath || "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\.\./g, "");
  }

  getSessionPath(userId, sessionId, folder, fileName) {
    return this.normalizeStoragePath(
      `users/${userId}/sessions/${sessionId}/${folder}/${fileName}`
    );
  }

  async writeLocalFile(storagePath, buffer) {
    const normalized = this.normalizeStoragePath(storagePath);
    const absolute = path.join(this.localRoot, normalized);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, buffer);
    return normalized;
  }

  async readLocalFile(storagePath) {
    const normalized = this.normalizeStoragePath(storagePath);
    const absolute = path.join(this.localRoot, normalized);
    return fs.readFile(absolute);
  }

  /**
   * Initialize Firebase Admin SDK
   * In production, use service account key from environment
   */
  async initialize(serviceAccountKey) {
    try {
      if (!admin.apps.length && serviceAccountKey) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountKey),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
      }
      this.bucket = admin.storage().bucket();
      this.initialized = true;
      console.log("Firebase Storage initialized");
    } catch (error) {
      console.warn("Firebase initialization skipped - using local storage fallback", error.message);
      this.initialized = false;
    }
  }

  async uploadSessionFile(buffer, options = {}) {
    const {
      userId,
      sessionId,
      folder = "videos",
      fileName = `file-${Date.now()}.bin`,
      mimeType = "application/octet-stream",
      metadata = {},
    } = options;

    const storagePath = this.getSessionPath(userId, sessionId, folder, fileName);

    if (this.initialized && this.bucket) {
      try {
        const file = this.bucket.file(storagePath);

        await file.save(buffer, {
          metadata: {
            contentType: mimeType,
            metadata: {
              sessionId,
              uploadedAt: new Date().toISOString(),
              ...metadata,
            },
          },
        });

        return {
          success: true,
          path: storagePath,
          url: `https://storage.googleapis.com/${this.bucket.name}/${storagePath}`,
          storageProvider: "firebase",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.warn("Firebase upload failed, using local storage fallback", error.message);
      }
    }

    const localPath = await this.writeLocalFile(storagePath, buffer);
    return {
      success: true,
      path: localPath,
      url: null,
      storageProvider: "local",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Upload chunk to Firebase Storage
   */
  async uploadChunk(buffer, userId, sessionId, chunkIndex, metadata = {}) {
    const fileType = metadata.fileType || "video";
    const folder = fileType === "audio" ? "audios" : "videos";
    const extension = metadata.extension || "webm";
    const fileName = `chunk-${chunkIndex}.${extension}`;

    try {
      return await this.uploadSessionFile(buffer, {
        userId,
        sessionId,
        folder,
        fileName,
        mimeType: metadata.mimeType || "video/webm",
        metadata: {
          chunkIndex: chunkIndex.toString(),
          ...metadata,
        },
      });
    } catch (error) {
      console.error("Chunk upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Download chunk from Firebase Storage
   */
  async downloadChunk(userId, sessionId, chunkIndex) {
    try {
      const filePath = this.getSessionPath(
        userId,
        sessionId,
        "videos",
        `chunk-${chunkIndex}.webm`
      );
      return this.readStoredFile(filePath);
    } catch (error) {
      console.error("Firebase download error:", error);
      return null;
    }
  }

  async readStoredFile(storagePath) {
    const normalized = this.normalizeStoragePath(storagePath);

    if (this.initialized && this.bucket) {
      try {
        const file = this.bucket.file(normalized);
        const [exists] = await file.exists();
        if (exists) {
          const [buffer] = await file.download();
          return buffer;
        }
      } catch (error) {
        console.warn("Firebase read failed, trying local file", error.message);
      }
    }

    try {
      return await this.readLocalFile(normalized);
    } catch {
      return null;
    }
  }

  /**
   * List all chunks for a session
   */
  async listSessionChunks(userId, sessionId) {
    try {
      if (!this.initialized) {
        return [];
      }

      const prefix = `users/${userId}/sessions/${sessionId}/videos/`;
      const [files] = await this.bucket.getFiles({ prefix });

      return files.map((file) => ({
        name: file.name,
        size: file.metadata.size,
        created: file.metadata.timeCreated,
      }));
    } catch (error) {
      console.error("Firebase list error:", error);
      return [];
    }
  }

  /**
   * Delete evidence session (admin only)
   */
  async deleteSession(userId, sessionId) {
    try {
      if (this.initialized && this.bucket) {
        const prefix = `users/${userId}/sessions/${sessionId}/`;
        const [files] = await this.bucket.getFiles({ prefix });
        await Promise.all(files.map((file) => file.delete()));
      }

      const localDir = path.join(this.localRoot, `users/${userId}/sessions/${sessionId}`);
      await fs.rm(localDir, { recursive: true, force: true });

      return true;
    } catch (error) {
      console.error("Firebase delete error:", error);
      return false;
    }
  }

  /**
   * Generate signed URL for time-limited access
   */
  async generateSignedUrl(userId, sessionId, chunkIndex, expiresIn = 7 * 24 * 60 * 60 * 1000) {
    const filePath = this.getSessionPath(
      userId,
      sessionId,
      "videos",
      `chunk-${chunkIndex}.webm`
    );
    return this.generateSignedUrlForPath(filePath, expiresIn);
  }

  async generateSignedUrlForPath(storagePath, expiresIn = 7 * 24 * 60 * 60 * 1000) {
    try {
      if (!this.initialized || !this.bucket) {
        return null;
      }

      const file = this.bucket.file(this.normalizeStoragePath(storagePath));
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresIn,
      });

      return url;
    } catch (error) {
      console.error("Signed URL generation error:", error);
      return null;
    }
  }
}

export default new FirebaseStorageService();
