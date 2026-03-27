import mongoose from "mongoose";

const assistanceRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ["Medical", "Emergency", "Logistics", "General"],
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export const AssistanceRequest = mongoose.model("AssistanceRequest", assistanceRequestSchema);
