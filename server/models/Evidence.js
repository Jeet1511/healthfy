import mongoose from "mongoose";

const evidenceChunkSchema = new mongoose.Schema({
  chunkIndex: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  duration: Number,
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  cloudPath: String,
  uploadStatus: {
    type: String,
    enum: ["pending", "uploading", "success", "failed"],
    default: "pending",
  },
  retryCount: { type: Number, default: 0 },
  metadata: mongoose.Schema.Types.Mixed,
});

const evidenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number,
    recordingType: {
      type: String,
      enum: ["audio-only", "video-only", "audio-video", "location-only"],
      default: "audio-video",
    },
    status: {
      type: String,
      enum: ["recording", "syncing", "completed", "failed", "failed_partial"],
      default: "recording",
    },
    sessionState: {
      type: String,
      enum: ["active", "syncing", "completed", "failed_partial"],
      default: "active",
      index: true,
    },
    mode: {
      type: String,
      enum: ["daily", "emergency"],
      default: "emergency",
    },
    location: {
      startLatitude: Number,
      startLongitude: Number,
      endLatitude: Number,
      endLongitude: Number,
    },
    timeline: [
      {
        type: String,
        label: String,
        severity: {
          type: String,
          enum: ["info", "success", "warning", "error"],
          default: "info",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        payload: mongoose.Schema.Types.Mixed,
      },
    ],
    chunks: [evidenceChunkSchema],
    totalChunks: Number,
    uploadedChunks: { type: Number, default: 0 },
    totalSize: Number,
    cloudStoragePath: String,
    accessLink: String,
    isPublic: { type: Boolean, default: false },
    metadata: {
      deviceInfo: String,
      browserInfo: String,
      emergencyContactsNotified: [String],
      networkOnline: Boolean,
      silentMode: Boolean,
      backgroundRecording: Boolean,
      chunkDurationMs: Number,
      notes: String,
      voiceProofUrl: String,
      incidentDescription: String,
      trustedLinkExpiresAt: Date,
    },
    tamperProof: {
      hash: String,
      signature: String,
      verified: Boolean,
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
evidenceSchema.index({ userId: 1, createdAt: -1 });
evidenceSchema.index({ sessionId: 1 });
evidenceSchema.index({ status: 1 });

export const Evidence = mongoose.model("Evidence", evidenceSchema);
