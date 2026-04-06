import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  startEvidenceSession,
  uploadEvidenceChunk,
  retryChunkUpload,
  completeEvidenceSession,
  getEvidenceSessions,
  getEvidenceSession,
  getChunkDownloadLink,
  deleteEvidenceSession,
  shareEvidenceSession,
} from "../controllers/evidenceController.js";

const router = Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per chunk
  },
});

// All routes require authentication
router.use(authMiddleware);

/**
 * Evidence Session Management
 */
router.post("/start", startEvidenceSession);
router.post("/complete/:sessionId", completeEvidenceSession);
router.get("", getEvidenceSessions);
router.get("/:sessionId", getEvidenceSession);
router.delete("/:sessionId", deleteEvidenceSession);

/**
 * Chunk Upload & Download
 */
router.post("/upload-chunk", upload.single("chunk"), uploadEvidenceChunk);
router.post("/:sessionId/chunks/:chunkIndex/retry", upload.single("chunk"), retryChunkUpload);
router.get("/:sessionId/chunks/:chunkIndex/download", getChunkDownloadLink);

/**
 * Sharing & Alerts
 */
router.post("/:sessionId/share", shareEvidenceSession);

export default router;
