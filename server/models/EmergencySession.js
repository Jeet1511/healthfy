import mongoose from "mongoose";

const trustedAccessLinkSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    scope: {
      type: String,
      enum: ["read-only"],
      default: "read-only",
    },
    label: String,
    revoked: { type: Boolean, default: false },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    severity: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    timestamp: { type: Date, default: Date.now },
    payload: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const emergencySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["daily", "emergency"],
      default: "emergency",
      index: true,
    },
    state: {
      type: String,
      enum: ["active", "syncing", "completed", "failed_partial"],
      default: "active",
      index: true,
    },
    triggerSource: {
      type: String,
      default: "manual",
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: Date,
    durationSeconds: {
      type: Number,
      default: 0,
    },
    recordingProfile: {
      requestedType: {
        type: String,
        enum: ["audio-video", "audio-only", "video-only", "location-only"],
        default: "audio-video",
      },
      activeType: {
        type: String,
        enum: ["audio-video", "audio-only", "video-only", "location-only"],
        default: "location-only",
      },
      hasAudio: { type: Boolean, default: false },
      hasVideo: { type: Boolean, default: false },
    },
    storageRoot: {
      type: String,
      required: true,
    },
    thumbnailPath: String,
    latestLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      source: String,
      timestamp: Date,
    },
    stats: {
      totalChunks: { type: Number, default: 0 },
      uploadedChunks: { type: Number, default: 0 },
      failedChunks: { type: Number, default: 0 },
      pendingChunks: { type: Number, default: 0 },
      locationLogsCount: { type: Number, default: 0 },
      eventsCount: { type: Number, default: 0 },
      mediaCount: { type: Number, default: 0 },
    },
    timeline: [timelineEventSchema],
    trustedAccessLinks: [trustedAccessLinkSchema],
    incident: {
      voiceProofUrl: String,
      incidentDescription: String,
      noteText: String,
      attachments: [
        {
          fileName: String,
          fileType: String,
          storagePath: String,
          mimeType: String,
          sizeBytes: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

emergencySessionSchema.index({ userId: 1, startedAt: -1 });
emergencySessionSchema.index({ userId: 1, state: 1, startedAt: -1 });
emergencySessionSchema.index({ "trustedAccessLinks.tokenHash": 1 });

export const EmergencySession = mongoose.model(
  "EmergencySession",
  emergencySessionSchema,
  "emergency_sessions"
);
