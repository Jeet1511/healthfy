import mongoose from "mongoose";

const emergencyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
      },
      dateOfBirth: {
        type: Date,
      },
    },
    medicalInfo: {
      bloodGroup: {
        type: String,
        enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
        default: "O+",
      },
      allergies: [
        {
          type: String,
        },
      ],
      medicalConditions: [
        {
          condition: String,
          severity: {
            type: String,
            enum: ["mild", "moderate", "severe"],
          },
        },
      ],
      medications: [
        {
          type: String,
        },
      ],
      emergencyPhysician: {
        name: String,
        phone: String,
        email: String,
      },
    },
    emergencyContacts: [
      {
        name: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          enum: ["family", "friend", "colleague", "other"],
        },
        phone: {
          type: String,
          required: true,
        },
        email: {
          type: String,
        },
        priority: {
          type: Number,
          default: 0,
        },
      },
    ],
    safeZones: [
      {
        name: String,
        latitude: Number,
        longitude: Number,
        radius: Number, // in meters
      },
    ],
    preferences: {
      autoRecord: {
        type: Boolean,
        default: true,
      },
      autoNotify: {
        type: Boolean,
        default: true,
      },
      enableVoiceCommands: {
        type: Boolean,
        default: true,
      },
      enableShakeDetection: {
        type: Boolean,
        default: true,
      },
      privacyMode: {
        type: Boolean,
        default: false,
      },
      shareMediaWithAuthorities: {
        type: Boolean,
        default: true,
      },
    },
    emergencyHistory: [
      {
        triggeredAt: Date,
        reason: String,
        duration: Number, // in seconds
        location: {
          latitude: Number,
          longitude: Number,
        },
        audio: Boolean,
        video: Boolean,
        contactsNotified: Number,
        outcome: {
          type: String,
          enum: ["resolved", "assistance-provided", "authorities-arrived", "cancelled"],
        },
        notes: String,
      },
    ],
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Calculate profile completion
emergencyProfileSchema.methods.updateCompletion = function () {
  const requiredFields = {
    personalInfo: ["name", "phone"],
    medicalInfo: ["bloodGroup"],
    emergencyContacts: true, // at least one contact
  };

  let isComplete = true;

  // Check personal info
  for (const field of requiredFields.personalInfo) {
    if (!this.personalInfo[field]) {
      isComplete = false;
      break;
    }
  }

  // Check medical info
  if (!this.medicalInfo.bloodGroup) {
    isComplete = false;
  }

  // Check emergency contacts
  if (!this.emergencyContacts || this.emergencyContacts.length === 0) {
    isComplete = false;
  }

  this.isComplete = isComplete;
  return this;
};

// Get active emergency contacts (sorted by priority)
emergencyProfileSchema.methods.getActiveContacts = function () {
  return this.emergencyContacts.sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

// Record emergency event
emergencyProfileSchema.methods.recordEmergency = function (emergencyData) {
  this.emergencyHistory.push({
    triggeredAt: new Date(),
    ...emergencyData,
  });

  // Keep only last 50 emergencies
  if (this.emergencyHistory.length > 50) {
    this.emergencyHistory = this.emergencyHistory.slice(-50);
  }

  return this;
};

export const EmergencyProfile = mongoose.model("EmergencyProfile", emergencyProfileSchema);
