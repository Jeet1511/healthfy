import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

/**
 * Firebase Cloud Storage Service
 * Handles secure upload and retrieval of evidence files
 */

class FirebaseStorageService {
  constructor() {
    this.bucket = null;
    this.initialized = false;
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

  /**
   * Upload chunk to Firebase Storage
   */
  async uploadChunk(buffer, userId, sessionId, chunkIndex, metadata = {}) {
    try {
      if (!this.initialized) {
        return {
          success: false,
          error: "Firebase not initialized",
          localPath: `${userId}/${sessionId}/chunk-${chunkIndex}`,
        };
      }

      const filePath = `evidence/${userId}/${sessionId}/chunks/chunk-${chunkIndex}.webm`;
      const file = this.bucket.file(filePath);

      await file.save(buffer, {
        metadata: {
          metadata: {
            sessionId,
            chunkIndex: chunkIndex.toString(),
            uploadedAt: new Date().toISOString(),
            ...metadata,
          },
        },
      });

      // Make file public or set custom access control
      await file.makePublic();

      return {
        success: true,
        path: filePath,
        url: `https://storage.googleapis.com/${this.bucket.name}/${filePath}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Firebase upload error:", error);
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
      if (!this.initialized) {
        return null;
      }

      const filePath = `evidence/${userId}/${sessionId}/chunks/chunk-${chunkIndex}.webm`;
      const file = this.bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }

      const [buffer] = await file.download();
      return buffer;
    } catch (error) {
      console.error("Firebase download error:", error);
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

      const prefix = `evidence/${userId}/${sessionId}/chunks/`;
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
      if (!this.initialized) {
        return false;
      }

      const prefix = `evidence/${userId}/${sessionId}/`;
      const [files] = await this.bucket.getFiles({ prefix });

      await Promise.all(files.map((file) => file.delete()));

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
    try {
      if (!this.initialized) {
        return null;
      }

      const filePath = `evidence/${userId}/${sessionId}/chunks/chunk-${chunkIndex}.webm`;
      const file = this.bucket.file(filePath);

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
