import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  appendLocationLog,
  downloadSessionMedia,
  downloadSharedSessionMedia,
  generateTrustedAccessLink,
  getEmergencySessionDetail,
  getEmergencySessions,
  getSharedEvidenceSession,
  logSessionEvent,
  startEvidenceSession,
  uploadEvidenceChunk,
  retryChunkUpload,
  completeEvidenceSession,
  getEvidenceSessions,
  getEvidenceSession,
  getChunkDownloadLink,
  deleteEvidenceSession,
  shareEvidenceSession,
  upsertIncidentNote,
  uploadVoiceIncidentProof,
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

// Public trusted-contact read-only routes
router.get("/shared/:token", getSharedEvidenceSession);
router.get("/shared/:token/media/:mediaId/download", downloadSharedSessionMedia);

// All routes below require authentication
router.use(authMiddleware);

/**
 * Mode-aware emergency evidence dashboard routes
 */
router.get("/sessions", getEmergencySessions);
router.get("/sessions/:sessionId", getEmergencySessionDetail);
router.post("/sessions/:sessionId/events", logSessionEvent);
router.post("/location-log", appendLocationLog);
router.post("/sessions/:sessionId/incident-note", upsertIncidentNote);
router.post(
  "/sessions/:sessionId/voi",
  upload.fields([
    { name: "voiceProof", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  uploadVoiceIncidentProof
);
router.post("/sessions/:sessionId/share-link", generateTrustedAccessLink);
router.get("/sessions/:sessionId/media/:mediaId/download", downloadSessionMedia);

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
