import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    activityHistory: [
      {
        label: { type: String, required: true },
        category: {
          type: String,
          enum: ["emergency", "safety", "medical", "disaster", "explore", "auth", "general"],
          default: "general",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    emergencyLogs: [
      {
        status: {
          type: String,
          enum: ["CRITICAL", "MODERATE", "SAFE"],
          default: "SAFE",
        },
        category: {
          type: String,
          enum: ["safety", "medical", "disaster"],
          default: "safety",
        },
        summary: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    searchLogs: [
      {
        query: { type: String, required: true },
        type: {
          type: String,
          enum: ["hospital", "police", "fire", "shelter", "all"],
          default: "all",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
