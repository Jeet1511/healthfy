import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    fileType: String,
    storagePath: String,
    mimeType: String,
    sizeBytes: Number,
  },
  { _id: false }
);

const incidentNoteSchema = new mongoose.Schema(
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
    incidentDescription: {
      type: String,
      default: "",
    },
    noteText: {
      type: String,
      default: "",
    },
    voiceProofUrl: String,
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

incidentNoteSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const IncidentNote = mongoose.model("IncidentNote", incidentNoteSchema, "incident_notes");
