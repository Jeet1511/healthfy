import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema(
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
      index: true,
    },
    fileType: {
      type: String,
      enum: ["video", "audio", "thumbnail", "voice-proof", "attachment"],
      required: true,
      index: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    displayName: String,
    mimeType: String,
    sizeBytes: Number,
    chunkIndex: Number,
    durationMs: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadStatus: {
      type: String,
      enum: ["pending", "uploading", "success", "failed"],
      default: "pending",
      index: true,
    },
    checksum: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

mediaFileSchema.index({ userId: 1, sessionId: 1, fileType: 1, chunkIndex: 1 });

export const MediaFile = mongoose.model("MediaFile", mediaFileSchema, "media_files");
