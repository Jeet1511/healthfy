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
      enum: ["audio-only", "audio-video"],
      default: "audio-video",
    },
    status: {
      type: String,
      enum: ["recording", "completed", "failed"],
      default: "recording",
    },
    location: {
      startLatitude: Number,
      startLongitude: Number,
      endLatitude: Number,
      endLongitude: Number,
    },
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
      notes: String,
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
