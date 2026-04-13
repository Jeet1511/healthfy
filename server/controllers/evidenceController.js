import crypto from "node:crypto";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { Evidence } from "../models/Evidence.js";
import { EmergencySession } from "../models/EmergencySession.js";
import { IncidentNote } from "../models/IncidentNote.js";
import { LocationLog } from "../models/LocationLog.js";
import { MediaFile } from "../models/MediaFile.js";
import firebaseStorageService from "../services/firebaseStorageService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_TIMELINE_EVENTS = 600;
const MAX_LOCATION_LOGS_RESPONSE = 800;

function parseJSON(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseNumber(value, fallback = null) {
  const next = Number(value);
  if (Number.isFinite(next)) {
    return next;
  }
  return fallback;
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseLocationInput(locationInput) {
  const value = parseJSON(locationInput, locationInput);
  if (!value || typeof value !== "object") return null;

  const latitude = parseNumber(value.latitude, null);
  const longitude = parseNumber(value.longitude, null);
  if (latitude == null || longitude == null) return null;

  return {
    latitude,
    longitude,
    accuracy: parseNumber(value.accuracy, null),
    speed: parseNumber(value.speed, null),
    heading: parseNumber(value.heading, null),
    source: value.source || "gps",
    timestamp: value.timestamp ? new Date(value.timestamp) : new Date(),
  };
}

function trimTimeline(timeline = []) {
  if (timeline.length <= MAX_TIMELINE_EVENTS) return timeline;
  return timeline.slice(-MAX_TIMELINE_EVENTS);
}

function buildStorageRoot(userId, sessionId) {
  return `/users/${userId}/sessions/${sessionId}`;
}

function inferFileTypeFromMime(mimeType = "") {
  const value = mimeType.toLowerCase();
  if (value.startsWith("audio/")) return "audio";
  return "video";
}

function inferExtension(mimeType = "", originalName = "") {
  const byName = path.extname(originalName || "").replace(".", "");
  if (byName) return byName;
  const raw = mimeType.split("/")[1] || "bin";
  return raw.split(";")[0] || "bin";
}

function inferRecordingProfile(mediaFiles = [], fallbackType = "audio-video") {
  const hasAudio = mediaFiles.some((file) => file.fileType === "audio" || file.fileType === "voice-proof");
  const hasVideo = mediaFiles.some((file) => file.fileType === "video");

  let activeType = "location-only";
  if (hasAudio && hasVideo) activeType = "audio-video";
  if (hasAudio && !hasVideo) activeType = "audio-only";
  if (!hasAudio && hasVideo) activeType = "video-only";

  return {
    requestedType: fallbackType,
    activeType,
    hasAudio,
    hasVideo,
  };
}

function getClientBaseUrl() {
  return process.env.CLIENT_URL || "https://localhost:5173";
}

function getServerBaseUrl() {
  const base = process.env.SERVER_URL || "https://localhost:5000";
  return base.replace(/\/$/, "");
}

function sanitizeFileName(name = "file") {
  return String(name).replace(/[\r\n\\/]+/g, "-");
}

function buildSessionState(evidence, completed = false) {
  if (!evidence) {
    return completed ? "failed_partial" : "active";
  }

  const failedChunks = evidence.chunks.filter((chunk) => chunk.uploadStatus === "failed").length;
  const uploadedChunks = evidence.uploadedChunks || 0;
  const totalChunks = evidence.totalChunks || 0;

  if (completed) {
    if (failedChunks > 0) {
      return "failed_partial";
    }
    if (uploadedChunks < totalChunks) {
      return "syncing";
    }
    return "completed";
  }

  if (failedChunks > 0) {
    return "syncing";
  }
  return "active";
}

async function ensureEmergencySession({
  userId,
  sessionId,
  recordingType = "audio-video",
  mode = "emergency",
  triggerSource = "manual",
}) {
  let session = await EmergencySession.findOne({ userId, sessionId });

  if (!session) {
    session = await EmergencySession.create({
      userId,
      sessionId,
      mode,
      state: "active",
      triggerSource,
      storageRoot: buildStorageRoot(userId, sessionId),
      recordingProfile: {
        requestedType: recordingType,
        activeType: "location-only",
        hasAudio: false,
        hasVideo: false,
      },
      timeline: [
        {
          type: "sos_triggered",
          label: "SOS triggered",
          severity: mode === "emergency" ? "error" : "warning",
          timestamp: new Date(),
        },
        {
          type: "recording_started",
          label: "Evidence capture initialized",
          severity: "info",
          timestamp: new Date(),
        },
      ],
    });
  }

  return session;
}

async function refreshEmergencySessionStats(sessionId, userId) {
  const [session, evidence, mediaFiles, locationLogsCount, incidentNote, lastLocation] = await Promise.all([
    EmergencySession.findOne({ userId, sessionId }),
    Evidence.findOne({ userId, sessionId }),
    MediaFile.find({ userId, sessionId }).select("fileType uploadStatus").lean(),
    LocationLog.countDocuments({ userId, sessionId }),
    IncidentNote.findOne({ userId, sessionId }).lean(),
    LocationLog.findOne({ userId, sessionId }).sort({ recordedAt: -1 }).lean(),
  ]);

  if (!session) {
    return null;
  }

  const uploadedChunks = evidence?.uploadedChunks || 0;
  const totalChunks = evidence?.totalChunks || 0;
  const failedChunks = evidence?.chunks?.filter((chunk) => chunk.uploadStatus === "failed").length || 0;
  const pendingChunks = Math.max(totalChunks - uploadedChunks - failedChunks, 0);

  const profile = inferRecordingProfile(mediaFiles, evidence?.recordingType || session.recordingProfile.requestedType);

  session.recordingProfile = {
    ...session.recordingProfile,
    ...profile,
  };

  session.stats = {
    totalChunks,
    uploadedChunks,
    failedChunks,
    pendingChunks,
    locationLogsCount,
    eventsCount: session.timeline?.length || 0,
    mediaCount: mediaFiles.length,
  };

  if (lastLocation) {
    session.latestLocation = {
      latitude: lastLocation.latitude,
      longitude: lastLocation.longitude,
      accuracy: lastLocation.accuracy,
      source: lastLocation.source,
      timestamp: lastLocation.recordedAt,
    };
  }

  if (incidentNote) {
    session.incident = {
      ...session.incident,
      voiceProofUrl: incidentNote.voiceProofUrl || session.incident?.voiceProofUrl,
      incidentDescription: incidentNote.incidentDescription || session.incident?.incidentDescription,
      noteText: incidentNote.noteText || session.incident?.noteText,
      attachments: incidentNote.attachments || session.incident?.attachments || [],
    };
  }

  await session.save();
  return session;
}

async function appendTimelineEvent({ userId, sessionId, type, label, severity = "info", payload = null, timestamp = null }) {
  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) return null;

  const nextEvent = {
    type,
    label,
    severity,
    payload,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  };

  session.timeline = trimTimeline([...(session.timeline || []), nextEvent]);
  session.stats = {
    ...session.stats,
    eventsCount: session.timeline.length,
  };

  await session.save();

  await Evidence.updateOne(
    { userId, sessionId },
    {
      $push: {
        timeline: {
          $each: [nextEvent],
          $slice: -MAX_TIMELINE_EVENTS,
        },
      },
    }
  );

  return nextEvent;
}

async function getSessionForToken(token) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await EmergencySession.findOne({ "trustedAccessLinks.tokenHash": tokenHash });

  if (!session) {
    return null;
  }

  const link = (session.trustedAccessLinks || []).find(
    (item) => item.tokenHash === tokenHash && !item.revoked && new Date(item.expiresAt).getTime() > Date.now()
  );

  if (!link) {
    return null;
  }

  return { session, link };
}

async function buildSessionDetailResponse({ session, userId, sharedToken = null }) {
  const [evidence, mediaFiles, locationLogs, incidentNote] = await Promise.all([
    Evidence.findOne({ userId, sessionId: session.sessionId }).lean(),
    MediaFile.find({ userId, sessionId: session.sessionId }).sort({ uploadedAt: 1 }).lean(),
    LocationLog.find({ userId, sessionId: session.sessionId })
      .sort({ recordedAt: 1 })
      .limit(MAX_LOCATION_LOGS_RESPONSE)
      .lean(),
    IncidentNote.findOne({ userId, sessionId: session.sessionId }).lean(),
  ]);

  const media = mediaFiles.map((item) => ({
    id: item._id.toString(),
    fileType: item.fileType,
    displayName: item.displayName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    chunkIndex: item.chunkIndex,
    durationMs: item.durationMs,
    uploadStatus: item.uploadStatus,
    uploadedAt: item.uploadedAt,
    storagePath: item.storagePath,
    downloadPath: sharedToken
      ? `/api/v1/evidence/shared/${sharedToken}/media/${item._id}/download`
      : `/api/v1/evidence/sessions/${session.sessionId}/media/${item._id}/download`,
  }));

  return {
    session: {
      sessionId: session.sessionId,
      mode: session.mode,
      state: session.state,
      triggerSource: session.triggerSource,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationSeconds: session.durationSeconds,
      recordingProfile: session.recordingProfile,
      storageRoot: session.storageRoot,
      latestLocation: session.latestLocation,
      stats: session.stats,
      timeline: session.timeline,
      incident: {
        voiceProofUrl: incidentNote?.voiceProofUrl || session.incident?.voiceProofUrl || "",
        incidentDescription: incidentNote?.incidentDescription || session.incident?.incidentDescription || "",
        noteText: incidentNote?.noteText || session.incident?.noteText || "",
        attachments: incidentNote?.attachments || session.incident?.attachments || [],
      },
      evidenceStatus: evidence?.status || null,
    },
    media,
    locationLogs,
  };
}

/**
 * Start a new evidence recording session
 */
export const startEvidenceSession = asyncHandler(async (req, res) => {
  const {
    recordingType = "audio-video",
    metadata = {},
    mode = "emergency",
    triggerSource = "manual",
    sessionId: preferredSessionId = null,
  } = req.body;
  const userId = req.user.id;

  const sessionId = preferredSessionId || uuidv4();

  let evidence = await Evidence.findOne({ userId, sessionId });

  if (!evidence) {
    evidence = await Evidence.create({
      userId,
      sessionId,
      recordingType,
      status: "recording",
      sessionState: "active",
      mode,
      metadata: {
        ...metadata,
        deviceInfo: req.headers["user-agent"],
      },
      timeline: [
        {
          type: "sos_triggered",
          label: "SOS triggered",
          severity: mode === "emergency" ? "error" : "warning",
          timestamp: new Date(),
        },
      ],
    });
  }

  const session = await ensureEmergencySession({
    userId,
    sessionId,
    recordingType,
    mode,
    triggerSource,
  });

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "session_started",
    label: "Emergency session started",
    severity: mode === "emergency" ? "warning" : "info",
    payload: { recordingType, triggerSource },
  });

  const refreshed = await refreshEmergencySessionStats(sessionId, userId);

  res.status(201).json({
    status: "success",
    data: {
      sessionId,
      evidenceId: evidence._id,
      startTime: evidence.startTime,
      mode,
      state: refreshed?.state || session.state,
      storageRoot: refreshed?.storageRoot || session.storageRoot,
    },
  });
});

/**
 * Upload evidence chunk
 * Real-time chunk streaming - called multiple times during recording
 */
export const uploadEvidenceChunk = asyncHandler(async (req, res) => {
  const { sessionId, duration, location, mode = "emergency", reason = "chunk-upload" } = req.body;
  const chunkIndex = parseNumber(req.body.chunkIndex, null);
  const userId = req.user.id;

  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  if (chunkIndex == null) {
    throw new AppError("Chunk index is required", 400);
  }

  const locationData = parseLocationInput(location);
  const fileType = inferFileTypeFromMime(req.file.mimetype);
  const extension = inferExtension(req.file.mimetype, req.file.originalname);

  let evidence = await Evidence.findOne({ sessionId, userId });

  if (!evidence) {
    evidence = await Evidence.create({
      userId,
      sessionId,
      recordingType: fileType === "audio" ? "audio-only" : "video-only",
      status: "recording",
      sessionState: "active",
      mode,
      metadata: {
        deviceInfo: req.headers["user-agent"],
      },
    });
  }

  await ensureEmergencySession({
    userId,
    sessionId,
    recordingType: evidence.recordingType,
    mode,
    triggerSource: "chunk-autocreate",
  });

  const uploadResult = await firebaseStorageService.uploadChunk(
    req.file.buffer,
    userId,
    sessionId,
    chunkIndex,
    {
      fileType,
      extension,
      mimeType: req.file.mimetype,
      duration: parseNumber(duration, null),
      timestamp: new Date().toISOString(),
    }
  );

  const chunk = {
    chunkIndex,
    duration: parseNumber(duration, null),
    location: locationData,
    cloudPath: uploadResult.path,
    uploadStatus: uploadResult.success ? "success" : "failed",
    metadata: {
      ...uploadResult,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
    },
  };

  const existingChunkIndex = evidence.chunks.findIndex((entry) => entry.chunkIndex === chunkIndex);
  if (existingChunkIndex >= 0) {
    evidence.chunks[existingChunkIndex] = chunk;
  } else {
    evidence.chunks.push(chunk);
  }

  evidence.totalChunks = Math.max(evidence.totalChunks || 0, chunkIndex + 1);
  evidence.uploadedChunks = evidence.chunks.filter((entry) => entry.uploadStatus === "success").length;
  evidence.totalSize = (evidence.totalSize || 0) + (req.file.size || 0);
  evidence.status = uploadResult.success ? "recording" : "syncing";
  evidence.sessionState = buildSessionState(evidence, false);

  if (locationData) {
    if (!evidence.location?.startLatitude) {
      evidence.location.startLatitude = locationData.latitude;
      evidence.location.startLongitude = locationData.longitude;
    }
    evidence.location.endLatitude = locationData.latitude;
    evidence.location.endLongitude = locationData.longitude;

    await LocationLog.create({
      userId,
      sessionId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      speed: locationData.speed,
      heading: locationData.heading,
      source: locationData.source,
      mode,
      reason,
      recordedAt: locationData.timestamp || new Date(),
    });
  }

  await evidence.save();

  await MediaFile.findOneAndUpdate(
    { userId, sessionId, fileType, chunkIndex },
    {
      userId,
      sessionId,
      fileType,
      chunkIndex,
      displayName: req.file.originalname || `${fileType}-chunk-${chunkIndex}.${extension}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      durationMs: parseNumber(duration, null),
      storagePath: uploadResult.path || `users/${userId}/sessions/${sessionId}/${fileType === "audio" ? "audios" : "videos"}/chunk-${chunkIndex}.${extension}`,
      uploadStatus: uploadResult.success ? "success" : "failed",
      uploadedAt: new Date(),
      metadata: {
        chunkIndex,
        source: "chunk-upload",
        storageProvider: uploadResult.storageProvider || "unknown",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const eventLabel = uploadResult.success
    ? `Chunk ${chunkIndex} uploaded`
    : `Chunk ${chunkIndex} queued for retry`;

  await appendTimelineEvent({
    userId,
    sessionId,
    type: uploadResult.success ? "upload_success" : "upload_failed",
    label: eventLabel,
    severity: uploadResult.success ? "success" : "warning",
    payload: {
      chunkIndex,
      fileType,
      storagePath: uploadResult.path,
      sizeBytes: req.file.size,
      durationMs: parseNumber(duration, null),
    },
  });

  const refreshed = await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      chunkIndex,
      uploadStatus: uploadResult.success ? "success" : "failed",
      cloudPath: uploadResult.path,
      sessionState: refreshed?.state || evidence.sessionState,
      uploadedChunks: evidence.uploadedChunks,
      totalChunks: evidence.totalChunks,
    },
  });
});

/**
 * Retry failed chunk upload
 */
export const retryChunkUpload = asyncHandler(async (req, res) => {
  const { sessionId, chunkIndex } = req.params;
  const userId = req.user.id;

  const parsedChunkIndex = parseNumber(chunkIndex, null);
  if (parsedChunkIndex == null) {
    throw new AppError("Invalid chunk index", 400);
  }

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  const chunk = evidence.chunks.find((entry) => entry.chunkIndex === parsedChunkIndex);
  if (!chunk) {
    throw new AppError("Chunk not found", 404);
  }

  chunk.retryCount = (chunk.retryCount || 0) + 1;
  if (chunk.retryCount > 5) {
    throw new AppError("Max retries exceeded", 400);
  }

  if (!req.file) {
    throw new AppError("No file uploaded for retry", 400);
  }

  const fileType = inferFileTypeFromMime(req.file.mimetype);
  const extension = inferExtension(req.file.mimetype, req.file.originalname);

  const uploadResult = await firebaseStorageService.uploadChunk(
    req.file.buffer,
    userId,
    sessionId,
    parsedChunkIndex,
    {
      fileType,
      extension,
      mimeType: req.file.mimetype,
      retryCount: chunk.retryCount,
      timestamp: new Date().toISOString(),
    }
  );

  chunk.uploadStatus = uploadResult.success ? "success" : "failed";
  chunk.cloudPath = uploadResult.path;
  chunk.metadata = {
    ...(chunk.metadata || {}),
    ...uploadResult,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  };

  evidence.uploadedChunks = evidence.chunks.filter((entry) => entry.uploadStatus === "success").length;
  evidence.status = uploadResult.success ? "recording" : "syncing";
  evidence.sessionState = buildSessionState(evidence, false);

  await evidence.save();

  await MediaFile.findOneAndUpdate(
    { userId, sessionId, fileType, chunkIndex: parsedChunkIndex },
    {
      uploadStatus: uploadResult.success ? "success" : "failed",
      storagePath: uploadResult.path,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  await appendTimelineEvent({
    userId,
    sessionId,
    type: uploadResult.success ? "upload_retry_success" : "upload_retry_failed",
    label: uploadResult.success
      ? `Retry succeeded for chunk ${parsedChunkIndex}`
      : `Retry failed for chunk ${parsedChunkIndex}`,
    severity: uploadResult.success ? "success" : "warning",
    payload: { chunkIndex: parsedChunkIndex, retryCount: chunk.retryCount },
  });

  const refreshed = await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      chunkIndex: parsedChunkIndex,
      uploadStatus: uploadResult.success ? "success" : "failed",
      retryCount: chunk.retryCount,
      sessionState: refreshed?.state || evidence.sessionState,
    },
  });
});

/**
 * Complete evidence recording session
 */
export const completeEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { notes = "", incidentDescription = "" } = req.body;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  evidence.endTime = new Date();
  evidence.duration = Math.max(1, Math.round((evidence.endTime - evidence.startTime) / 1000));

  if (notes) {
    evidence.metadata.notes = notes;
  }
  if (incidentDescription) {
    evidence.metadata.incidentDescription = incidentDescription;
  }

  const sessionState = buildSessionState(evidence, true);
  evidence.sessionState = sessionState;

  if (sessionState === "completed") {
    evidence.status = "completed";
  } else if (sessionState === "syncing") {
    evidence.status = "syncing";
  } else {
    evidence.status = "failed_partial";
  }

  await evidence.save();

  const session = await ensureEmergencySession({
    userId,
    sessionId,
    recordingType: evidence.recordingType,
    mode: evidence.mode || "emergency",
    triggerSource: "complete-call",
  });

  session.state = sessionState;
  session.endedAt = evidence.endTime;
  session.durationSeconds = evidence.duration;

  if (notes || incidentDescription) {
    const note = await IncidentNote.findOneAndUpdate(
      { userId, sessionId },
      {
        userId,
        sessionId,
        noteText: notes,
        incidentDescription,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    session.incident = {
      ...session.incident,
      noteText: note.noteText,
      incidentDescription: note.incidentDescription,
      voiceProofUrl: note.voiceProofUrl,
      attachments: note.attachments,
    };
  }

  await session.save();

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "recording_stopped",
    label: "Evidence capture completed",
    severity: sessionState === "completed" ? "success" : "warning",
    payload: {
      state: sessionState,
      uploadedChunks: evidence.uploadedChunks,
      totalChunks: evidence.totalChunks,
    },
  });

  const refreshed = await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      status: evidence.status,
      state: refreshed?.state || sessionState,
      duration: evidence.duration,
      totalChunks: evidence.totalChunks,
      uploadedChunks: evidence.uploadedChunks,
    },
  });
});

/**
 * Legacy list endpoint for backward compatibility
 */
export const getEvidenceSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 20, skip = 0 } = req.query;

  const query = { userId };
  if (status && status !== "all") {
    query.status = status;
  }

  const evidence = await Evidence.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .skip(parseInt(skip, 10))
    .select("-chunks");

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
 * New session-focused dashboard list endpoint
 */
export const getEmergencySessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    status = "all",
    mode,
    search = "",
    from,
    to,
    limit = 25,
    page = 1,
    skip = 0,
    excludeActive = "false",
  } = req.query;

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedSkipValue = Number(skip);
  const parsedSkip = Number.isFinite(parsedSkipValue)
    ? Math.max(Math.trunc(parsedSkipValue), 0)
    : (parsedPage - 1) * parsedLimit;

  const query = { userId };

  if (status && status !== "all") {
    query.state = status;
  }

  if (excludeActive === "true") {
    query.state = query.state ? query.state : { $ne: "active" };
  }

  if (mode && mode !== "all") {
    query.mode = mode;
  }

  if (search && String(search).trim()) {
    const safeSearch = escapeRegex(String(search).trim());
    query.$or = [
      { sessionId: { $regex: safeSearch, $options: "i" } },
      { triggerSource: { $regex: safeSearch, $options: "i" } },
      { mode: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (from || to) {
    query.startedAt = {};

    if (from) {
      const parsedFrom = new Date(from);
      if (!Number.isNaN(parsedFrom.getTime())) {
        query.startedAt.$gte = parsedFrom;
      }
    }

    if (to) {
      const parsedTo = new Date(to);
      if (!Number.isNaN(parsedTo.getTime())) {
        parsedTo.setHours(23, 59, 59, 999);
        query.startedAt.$lte = parsedTo;
      }
    }

    if (!Object.keys(query.startedAt).length) {
      delete query.startedAt;
    }
  }

  const sessions = await EmergencySession.find(query)
    .sort({ startedAt: -1 })
    .limit(parsedLimit)
    .skip(parsedSkip)
    .lean();

  const enriched = await Promise.all(
    sessions.map(async (session) => {
      const previewMedia = await MediaFile.findOne({
        userId,
        sessionId: session.sessionId,
        fileType: { $in: ["thumbnail", "video"] },
      })
        .sort({ fileType: 1, uploadedAt: 1 })
        .lean();

      return {
        sessionId: session.sessionId,
        mode: session.mode,
        state: session.state,
        triggerSource: session.triggerSource,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        recordingProfile: session.recordingProfile,
        stats: session.stats,
        latestLocation: session.latestLocation,
        thumbnailPath: session.thumbnailPath || previewMedia?.storagePath || null,
      };
    })
  );

  const total = await EmergencySession.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / parsedLimit));
  const currentPage = Math.min(parsedPage, totalPages);

  res.status(200).json({
    status: "success",
    data: {
      total,
      count: enriched.length,
      sessions: enriched,
      pagination: {
        page: currentPage,
        pageSize: parsedLimit,
        total,
        totalPages,
        hasNextPage: parsedSkip + enriched.length < total,
        hasPreviousPage: parsedSkip > 0,
      },
    },
  });
});

/**
 * Legacy detailed evidence endpoint
 */
export const getEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  const chunksWithUrls = await Promise.all(
    evidence.chunks.map(async (chunk) => ({
      ...chunk.toObject(),
      downloadUrl:
        (await firebaseStorageService.generateSignedUrlForPath(chunk.cloudPath, 24 * 60 * 60 * 1000)) || null,
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
 * Session detail endpoint used by dashboard
 */
export const getEmergencySessionDetail = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const payload = await buildSessionDetailResponse({ session, userId });

  res.status(200).json({
    status: "success",
    data: payload,
  });
});

/**
 * Append location logs to emergency session
 */
export const appendLocationLog = asyncHandler(async (req, res) => {
  const {
    sessionId,
    latitude,
    longitude,
    accuracy,
    speed,
    heading,
    source = "gps",
    mode = "emergency",
    reason = "watch",
    timestamp,
  } = req.body;
  const userId = req.user.id;

  const lat = parseNumber(latitude, null);
  const lng = parseNumber(longitude, null);

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  if (lat == null || lng == null) {
    throw new AppError("Latitude and longitude are required", 400);
  }

  await ensureEmergencySession({
    userId,
    sessionId,
    recordingType: "location-only",
    mode,
    triggerSource: "location-log",
  });

  const existingEvidence = await Evidence.findOne({ userId, sessionId });
  if (existingEvidence) {
    if (!existingEvidence.location?.startLatitude) {
      existingEvidence.location.startLatitude = lat;
      existingEvidence.location.startLongitude = lng;
    }
    existingEvidence.location.endLatitude = lat;
    existingEvidence.location.endLongitude = lng;
    await existingEvidence.save();
  }

  await LocationLog.create({
    userId,
    sessionId,
    latitude: lat,
    longitude: lng,
    accuracy: parseNumber(accuracy, null),
    speed: parseNumber(speed, null),
    heading: parseNumber(heading, null),
    source,
    mode,
    reason,
    recordedAt: timestamp ? new Date(timestamp) : new Date(),
  });

  const totalLogs = await LocationLog.countDocuments({ userId, sessionId });
  if (totalLogs % 12 === 0 || reason !== "watch") {
    await appendTimelineEvent({
      userId,
      sessionId,
      type: "location_update",
      label: "Location checkpoint captured",
      severity: "info",
      payload: {
        latitude: lat,
        longitude: lng,
        reason,
      },
    });
  }

  const refreshed = await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      locationLogsCount: refreshed?.stats?.locationLogsCount || totalLogs,
      state: refreshed?.state || "active",
    },
  });
});

/**
 * Append timeline event
 */
export const logSessionEvent = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const {
    type = "custom_event",
    label = "Event logged",
    severity = "info",
    payload = null,
    timestamp = null,
  } = req.body;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const event = await appendTimelineEvent({
    userId,
    sessionId,
    type,
    label,
    severity,
    payload,
    timestamp,
  });

  await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      event,
    },
  });
});

/**
 * Upsert text incident notes (VOI metadata)
 */
export const upsertIncidentNote = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const { incidentDescription = "", noteText = "", voiceProofUrl = "", attachments = [] } = req.body;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const parsedAttachments = Array.isArray(attachments) ? attachments : parseJSON(attachments, []);

  const note = await IncidentNote.findOneAndUpdate(
    { userId, sessionId },
    {
      userId,
      sessionId,
      incidentDescription,
      noteText,
      voiceProofUrl,
      attachments: parsedAttachments,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  session.incident = {
    voiceProofUrl: note.voiceProofUrl,
    incidentDescription: note.incidentDescription,
    noteText: note.noteText,
    attachments: note.attachments,
  };
  await session.save();

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "incident_note_updated",
    label: "Incident note updated",
    severity: "info",
  });

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      note,
    },
  });
});

/**
 * Upload voice proof and additional files (VOI)
 */
export const uploadVoiceIncidentProof = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const { incidentDescription = "", noteText = "" } = req.body;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const files = req.files || {};
  const voiceFile = files.voiceProof?.[0] || null;
  const attachmentFiles = files.attachments || [];

  let voiceProofUrl = "";
  const uploadedAttachments = [];

  if (voiceFile) {
    const extension = inferExtension(voiceFile.mimetype, voiceFile.originalname);
    const upload = await firebaseStorageService.uploadSessionFile(voiceFile.buffer, {
      userId,
      sessionId,
      folder: "audios",
      fileName: `voice-proof-${Date.now()}.${extension}`,
      mimeType: voiceFile.mimetype,
      metadata: {
        source: "voi",
      },
    });

    voiceProofUrl = upload.path;

    await MediaFile.create({
      userId,
      sessionId,
      fileType: "voice-proof",
      storagePath: upload.path,
      displayName: voiceFile.originalname,
      mimeType: voiceFile.mimetype,
      sizeBytes: voiceFile.size,
      uploadStatus: upload.success ? "success" : "failed",
      metadata: {
        source: "voi",
      },
    });
  }

  for (const file of attachmentFiles) {
    const extension = inferExtension(file.mimetype, file.originalname);
    const upload = await firebaseStorageService.uploadSessionFile(file.buffer, {
      userId,
      sessionId,
      folder: "thumbnails",
      fileName: `attachment-${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`,
      mimeType: file.mimetype,
      metadata: {
        source: "voi-attachment",
      },
    });

    const attachment = {
      fileName: file.originalname,
      fileType: extension,
      storagePath: upload.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };

    uploadedAttachments.push(attachment);

    await MediaFile.create({
      userId,
      sessionId,
      fileType: "attachment",
      storagePath: upload.path,
      displayName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadStatus: upload.success ? "success" : "failed",
      metadata: {
        source: "voi-attachment",
      },
    });
  }

  const currentNote = await IncidentNote.findOne({ userId, sessionId });

  const note = await IncidentNote.findOneAndUpdate(
    { userId, sessionId },
    {
      userId,
      sessionId,
      incidentDescription,
      noteText,
      voiceProofUrl: voiceProofUrl || currentNote?.voiceProofUrl || "",
      attachments: [...(currentNote?.attachments || []), ...uploadedAttachments],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  session.incident = {
    voiceProofUrl: note.voiceProofUrl,
    incidentDescription: note.incidentDescription,
    noteText: note.noteText,
    attachments: note.attachments,
  };
  await session.save();

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "voice_of_incident_uploaded",
    label: "Voice of incident evidence attached",
    severity: "info",
    payload: {
      hasVoiceProof: Boolean(voiceFile),
      attachmentCount: uploadedAttachments.length,
    },
  });

  await refreshEmergencySessionStats(sessionId, userId);

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      note,
    },
  });
});

/**
 * Generate secure token-based trusted contact link
 */
export const generateTrustedAccessLink = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;
  const { expiresInHours = 24, label = "Trusted contact", contactEmails = [] } = req.body;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + Number(expiresInHours || 24) * 60 * 60 * 1000);

  session.trustedAccessLinks.push({
    tokenHash,
    expiresAt,
    scope: "read-only",
    label,
  });

  await session.save();

  const evidence = await Evidence.findOne({ userId, sessionId });
  if (evidence) {
    evidence.isPublic = true;
    evidence.metadata.emergencyContactsNotified = Array.isArray(contactEmails)
      ? contactEmails
      : [];
    evidence.metadata.trustedLinkExpiresAt = expiresAt;
    evidence.accessLink = `${getClientBaseUrl()}/safety?sharedEvidenceToken=${rawToken}&session=${sessionId}`;
    await evidence.save();
  }

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "trusted_link_generated",
    label: "Trusted contact access link created",
    severity: "info",
    payload: {
      expiresAt,
      label,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      sessionId,
      accessLink: `${getClientBaseUrl()}/safety?sharedEvidenceToken=${rawToken}&session=${sessionId}`,
      apiAccessPath: `${getServerBaseUrl()}/api/v1/evidence/shared/${rawToken}`,
      expiresAt,
      scope: "read-only",
    },
  });
});

/**
 * Shared read-only session view for trusted contacts
 */
export const getSharedEvidenceSession = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const tokenLookup = await getSessionForToken(token);
  if (!tokenLookup) {
    throw new AppError("Shared link is invalid or expired", 403);
  }

  const { session, link } = tokenLookup;
  const payload = await buildSessionDetailResponse({
    session,
    userId: session.userId,
    sharedToken: token,
  });

  res.status(200).json({
    status: "success",
    data: {
      ...payload,
      access: {
        scope: link.scope,
        expiresAt: link.expiresAt,
        readOnly: true,
      },
    },
  });
});

/**
 * Download media file for session owner
 */
export const downloadSessionMedia = asyncHandler(async (req, res) => {
  const { sessionId, mediaId } = req.params;
  const userId = req.user.id;

  const media = await MediaFile.findOne({ _id: mediaId, sessionId, userId });
  if (!media) {
    throw new AppError("Media file not found", 404);
  }

  const signedUrl = await firebaseStorageService.generateSignedUrlForPath(
    media.storagePath,
    15 * 60 * 1000
  );

  if (signedUrl) {
    return res.redirect(signedUrl);
  }

  const buffer = await firebaseStorageService.readStoredFile(media.storagePath);
  if (!buffer) {
    throw new AppError("Unable to read media file", 404);
  }

  res.setHeader("Content-Type", media.mimeType || "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFileName(media.displayName || path.basename(media.storagePath))}"`
  );

  return res.send(buffer);
});

/**
 * Download media file for trusted shared session link
 */
export const downloadSharedSessionMedia = asyncHandler(async (req, res) => {
  const { token, mediaId } = req.params;

  const tokenLookup = await getSessionForToken(token);
  if (!tokenLookup) {
    throw new AppError("Shared link is invalid or expired", 403);
  }

  const { session } = tokenLookup;

  const media = await MediaFile.findOne({ _id: mediaId, sessionId: session.sessionId, userId: session.userId });
  if (!media) {
    throw new AppError("Media file not found", 404);
  }

  const signedUrl = await firebaseStorageService.generateSignedUrlForPath(
    media.storagePath,
    10 * 60 * 1000
  );

  if (signedUrl) {
    return res.redirect(signedUrl);
  }

  const buffer = await firebaseStorageService.readStoredFile(media.storagePath);
  if (!buffer) {
    throw new AppError("Unable to read media file", 404);
  }

  res.setHeader("Content-Type", media.mimeType || "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFileName(media.displayName || path.basename(media.storagePath))}"`
  );

  return res.send(buffer);
});

/**
 * Get download link for a chunk (legacy endpoint)
 */
export const getChunkDownloadLink = asyncHandler(async (req, res) => {
  const { sessionId, chunkIndex } = req.params;
  const userId = req.user.id;

  const parsedChunkIndex = parseNumber(chunkIndex, null);
  if (parsedChunkIndex == null) {
    throw new AppError("Invalid chunk index", 400);
  }

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  const chunk = evidence.chunks.find((entry) => entry.chunkIndex === parsedChunkIndex);
  if (!chunk) {
    throw new AppError("Chunk not found", 404);
  }

  const signedUrl = chunk.cloudPath
    ? await firebaseStorageService.generateSignedUrlForPath(
        chunk.cloudPath,
        24 * 60 * 60 * 1000
      )
    : null;

  const media = await MediaFile.findOne({ userId, sessionId, chunkIndex: parsedChunkIndex }).lean();

  res.status(200).json({
    status: "success",
    data: {
      downloadUrl:
        signedUrl ||
        (media
          ? `${getServerBaseUrl()}/api/v1/evidence/sessions/${sessionId}/media/${media._id}/download`
          : null),
      expiresIn: signedUrl ? "24 hours" : "owner auth required",
    },
  });
});

/**
 * Delete evidence session and linked records
 */
export const deleteEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const evidence = await Evidence.findOne({ sessionId, userId });
  if (!evidence) {
    throw new AppError("Evidence session not found", 404);
  }

  await firebaseStorageService.deleteSession(userId, sessionId);

  await Promise.all([
    evidence.deleteOne(),
    EmergencySession.deleteOne({ userId, sessionId }),
    MediaFile.deleteMany({ userId, sessionId }),
    LocationLog.deleteMany({ userId, sessionId }),
    IncidentNote.deleteOne({ userId, sessionId }),
  ]);

  res.status(200).json({
    status: "success",
    message: "Evidence session deleted",
  });
});

/**
 * Legacy share endpoint (compatible)
 */
export const shareEvidenceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { contactEmails = [], expiresInHours = 24 } = req.body;
  const userId = req.user.id;

  const session = await EmergencySession.findOne({ userId, sessionId });
  if (!session) {
    throw new AppError("Emergency session not found", 404);
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + Number(expiresInHours || 24) * 60 * 60 * 1000);

  session.trustedAccessLinks.push({
    tokenHash,
    expiresAt,
    scope: "read-only",
    label: "Shared evidence",
  });

  await session.save();

  const evidence = await Evidence.findOne({ userId, sessionId });
  if (evidence) {
    evidence.metadata.emergencyContactsNotified = Array.isArray(contactEmails)
      ? contactEmails
      : [];
    evidence.isPublic = true;
    evidence.accessLink = `${getClientBaseUrl()}/safety?sharedEvidenceToken=${rawToken}&session=${sessionId}`;
    evidence.metadata.trustedLinkExpiresAt = expiresAt;
    await evidence.save();
  }

  await appendTimelineEvent({
    userId,
    sessionId,
    type: "trusted_link_generated",
    label: "Share link generated for trusted contacts",
    severity: "info",
    payload: { expiresAt, contacts: contactEmails.length },
  });

  res.status(200).json({
    status: "success",
    data: {
      accessLink: `${getClientBaseUrl()}/safety?sharedEvidenceToken=${rawToken}&session=${sessionId}`,
      contactsNotified: contactEmails,
      expiresAt,
      scope: "read-only",
    },
  });
});
