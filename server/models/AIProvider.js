import mongoose from "mongoose";

const aiProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    apiKeyEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AIProvider = mongoose.model("AIProvider", aiProviderSchema);
