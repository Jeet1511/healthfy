import { v4 as uuidv4 } from "uuid";
import { Evidence } from "../models/Evidence.js";
import firebaseStorageService from "../services/firebaseStorageService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Start a new evidence recording session
 */
export const startEvidenceSession = asyncHandler(async (req, res) => {
  const { recordingType = "audio-video", metadata = {} } = req.body;
  const userId = req.user.id;

  const sessionId = uuidv4();

  const evidence = await Evidence.create({
    userId,
    sessionId,
    recordingType,
    status: "recording",
    metadata: {
      ...metadata,
      deviceInfo: req.headers["user-agent"],
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      sessionId,
      evidenceId: evidence._id,
      startTime: evidence.startTime,
    },
  });
});

/**
 * Upload evidence chunk
 * Real-time chunk streaming - called multiple times during recording
 */
export const uploadEvidenceChunk = asyncHandler(async (req, res) => {
  const { sessionId, chunkIndex, duration, location } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  // Find evidence session
  let evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  // Upload to cloud storage
  const uploadResult = await firebaseStorageService.uploadChunk(
    req.file.buffer,
    userId,
    sessionId,
    chunkIndex,
    {
      location,
      duration,
      timestamp: new Date().toISOString(),
    }
  );

  // Update evidence with chunk info
  const chunk = {
    chunkIndex,
    duration,
    location,
    cloudPath: uploadResult.path,
    uploadStatus: uploadResult.success ? "success" : "failed",
    metadata: uploadResult,
  };

  evidence.chunks.push(chunk);
  evidence.uploadedChunks = evidence.chunks.filter((c) => c.uploadStatus === "success").length;
  evidence.totalChunks = Math.max(evidence.totalChunks || 0, chunkIndex + 1);

  await evidence.save();

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      chunkIndex,
      uploadStatus: uploadResult.success ? "success" : "failed",
      cloudPath: uploadResult.path,
    },
  });
});

/**
 * Retry failed chunk upload
 */
export const retryChunkUpload = asyncHandler(async (req, res) => {
  const { sessionId, chunkIndex } = req.params;
  const userId = req.user.id;

  let evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  const chunk = evidence.chunks.find((c) => c.chunkIndex === parseInt(chunkIndex));
  if (!chunk) {
    throw new AppError("Chunk not found", 404);
  }

  // Increment retry count
  chunk.retryCount = (chunk.retryCount || 0) + 1;
  if (chunk.retryCount > 5) {
    throw new AppError("Max retries exceeded", 400);
  }

  if (!req.file) {
    throw new AppError("No file uploaded for retry", 400);
  }

  const uploadResult = await firebaseStorageService.uploadChunk(
    req.file.buffer,
    userId,
    sessionId,
    chunkIndex,
    { retry: chunk.retryCount }
  );

  chunk.uploadStatus = uploadResult.success ? "success" : "failed";
  chunk.cloudPath = uploadResult.path;

  evidence.uploadedChunks = evidence.chunks.filter((c) => c.uploadStatus === "success").length;

  await evidence.save();

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      chunkIndex,
      uploadStatus: uploadResult.success ? "success" : "failed",
      retryCount: chunk.retryCount,
    },
  });
});

/**
 * Complete evidence recording session
 */
export const completeEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { notes = "" } = req.body;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  evidence.status = "completed";
  evidence.endTime = new Date();
  evidence.duration = Math.round((evidence.endTime - evidence.startTime) / 1000);

  if (notes) {
    evidence.metadata.notes = notes;
  }

  await evidence.save();

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      status: "completed",
      duration: evidence.duration,
      totalChunks: evidence.totalChunks,
      uploadedChunks: evidence.uploadedChunks,
    },
  });
});

/**
 * Get all evidence sessions for user
 */
export const getEvidenceSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 20, skip = 0 } = req.query;

  const query = { userId };
  if (status) {
    query.status = status;
  }

  const evidence = await Evidence.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .select("-chunks"); // Don't return full chunk data in list

  const total = await Evidence.countDocuments(query);

  res.status(200).json({
    status: "success",
    data: {
      total,
      count: evidence.length,
      evidence,
    },
  });
});

/**
 * Get detailed evidence session with all chunks
 */
export const getEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  // Generate signed URLs for all chunks
  const chunksWithUrls = await Promise.all(
    evidence.chunks.map(async (chunk) => ({
      ...chunk.toObject(),
      downloadUrl: await firebaseStorageService.generateSignedUrl(userId, sessionId, chunk.chunkIndex),
    }))
  );

  res.status(200).json({
    status: "success",
    data: {
      ...evidence.toObject(),
      chunks: chunksWithUrls,
    },
  });
});

/**
 * Get download link for chunk
 */
export const getChunkDownloadLink = asyncHandler(async (req, res) => {
  const { sessionId, chunkIndex } = req.params;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  const chunk = evidence.chunks.find((c) => c.chunkIndex === parseInt(chunkIndex));
  if (!chunk) {
    throw new AppError("Chunk not found", 404);
  }

  const downloadUrl = await firebaseStorageService.generateSignedUrl(
    userId,
    sessionId,
    chunkIndex,
    24 * 60 * 60 * 1000 // 24 hours
  );

  res.status(200).json({
    status: "success",
    data: {
      downloadUrl,
      expiresIn: "24 hours",
    },
  });
});

/**
 * Delete evidence session (admin only or user owns it)
 */
export const deleteEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  // Delete from cloud storage
  await firebaseStorageService.deleteSession(userId, sessionId);

  // Delete from database
  await evidence.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Evidence session deleted",
  });
});

/**
 * Share evidence session with emergency contacts
 */
export const shareEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { contactEmails = [] } = req.body;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  evidence.metadata.emergencyContactsNotified = contactEmails;
  evidence.isPublic = true;

  // Generate shareable link
  evidence.accessLink = `${process.env.CLIENT_URL}/evidence/${sessionId}/${uuidv4()}`;

  await evidence.save();

  res.status(200).json({
    status: "success",
    data: {
      accessLink: evidence.accessLink,
      contactsNotified: contactEmails,
    },
  });
});
