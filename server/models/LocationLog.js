import mongoose from "mongoose";

const locationLogSchema = new mongoose.Schema(
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
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: Number,
    speed: Number,
    heading: Number,
    source: {
      type: String,
      default: "gps",
    },
    mode: {
      type: String,
      enum: ["daily", "emergency"],
      default: "emergency",
    },
    reason: String,
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

locationLogSchema.index({ userId: 1, sessionId: 1, recordedAt: 1 });

export const LocationLog = mongoose.model("LocationLog", locationLogSchema, "location_logs");
