import { Router } from "express";
import multer from "multer";
import { uploadEvidenceChunk } from "../controllers/evidenceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.use(authMiddleware);

router.post(
  "/upload-video",
  upload.single("video"),
  (req, res, next) => {
    if (!req.body?.chunkIndex) {
      req.body.chunkIndex = "0";
    }

    if (!req.body?.reason) {
      req.body.reason = "upload-video";
    }

    next();
  },
  uploadEvidenceChunk
);

export default router;
