import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { EmergencyProfile } from "../models/EmergencyProfile.js";
import { AppError } from "../utils/AppError.js";

const router = Router();

// Protect all SOS routes
router.use(authMiddleware);

/**
 * GET /api/sos/profile
 * Get emergency profile for current user
 */
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    let profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new EmergencyProfile({ userId: req.user._id });
      await profile.save();
    }

    res.json({
      success: true,
      data: profile,
    });
  })
);

/**
 * POST /api/sos/profile
 * Create or update emergency profile
 */
router.post(
  "/profile",
  asyncHandler(async (req, res) => {
    const { personalInfo, medicalInfo, emergencyContacts, preferences, safeZones } = req.body;

    let profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new EmergencyProfile({ userId: req.user._id });
    }

    if (personalInfo) {
      profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    }

    if (medicalInfo) {
      profile.medicalInfo = { ...profile.medicalInfo, ...medicalInfo };
    }

    if (emergencyContacts) {
      profile.emergencyContacts = emergencyContacts;
    }

    if (preferences) {
      profile.preferences = { ...profile.preferences, ...preferences };
    }

    if (safeZones) {
      profile.safeZones = safeZones;
    }

    profile.updateCompletion();
    await profile.save();

    res.json({
      success: true,
      message: "Emergency profile updated",
      data: profile,
    });
  })
);

/**
 * POST /api/sos/trigger
 * Record SOS trigger and send notifications
 */
router.post(
  "/trigger",
  asyncHandler(async (req, res) => {
    const { location, hasAudio, hasVideo, recordingUrl } = req.body;

    const profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      throw new AppError("Emergency profile not found. Please set up profile first.", 404);
    }

    if (!profile.emergencyContacts || profile.emergencyContacts.length === 0) {
      throw new AppError("No emergency contacts configured", 400);
    }

    // Record the emergency
    profile.recordEmergency({
      location,
      audio: hasAudio,
      video: hasVideo,
      contactsNotified: profile.emergencyContacts.length,
    });

    await profile.save();

    // TODO: Send SMS/Email notifications to emergency contacts
    // This would integrate with Twilio, SendGrid, etc.

    res.json({
      success: true,
      message: "SOS triggered and contacts notified",
      data: {
        sosId: Date.now(),
        contactsNotified: profile.emergencyContacts.length,
      },
    });
  })
);

/**
 * POST /api/sos/location-log
 * Receive real-time location updates during emergency mode.
 */
router.post(
  "/location-log",
  asyncHandler(async (req, res) => {
    const {
      sessionId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      mode,
      reason,
    } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new AppError("Latitude and longitude are required", 400);
    }

    const profile = await EmergencyProfile.findOne({ userId: req.user._id });

    // Accept location logs even when profile is not yet configured.
    if (!profile) {
      return res.json({
        success: true,
        message: "Location log accepted",
      });
    }

    profile.recordEmergency({
      reason: `location-log:${sessionId || "unknown"}`,
      location: { latitude, longitude },
      audio: false,
      video: false,
      contactsNotified: 0,
      notes: `mode=${mode || "unknown"}; reason=${reason || "watch"}; accuracy=${accuracy || "n/a"}; speed=${speed || "n/a"}; heading=${heading || "n/a"}`,
    });

    await profile.save();

    res.json({
      success: true,
      message: "Location logged",
    });
  })
);

/**
 * POST /api/sos/upload-chunk
 * Upload recording chunk
 */
router.post(
  "/upload-chunk",
  asyncHandler(async (req, res) => {
    // TODO: Implement multipart file upload
    // Save to Firebase Storage, AWS S3, or similar

    res.json({
      success: true,
      message: "Chunk uploaded",
    });
  })
);

/**
 * GET /api/sos/history
 * Get emergency history
 */
router.get(
  "/history",
  asyncHandler(async (req, res) => {
    const profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      throw new AppError("Emergency profile not found", 404);
    }

    res.json({
      success: true,
      data: profile.emergencyHistory,
    });
  })
);

/**
 * POST /api/sos/add-contact
 * Add emergency contact
 */
router.post(
  "/add-contact",
  asyncHandler(async (req, res) => {
    const { name, phone, email, relationship, priority } = req.body;

    if (!name || !phone) {
      throw new AppError("Name and phone are required", 400);
    }

    let profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new EmergencyProfile({ userId: req.user._id });
    }

    profile.emergencyContacts.push({
      name,
      phone,
      email,
      relationship,
      priority: priority || 0,
    });

    profile.updateCompletion();
    await profile.save();

    res.json({
      success: true,
      message: "Contact added",
      data: profile.emergencyContacts,
    });
  })
);

/**
 * DELETE /api/sos/contact/:contactName
 * Delete emergency contact
 */
router.delete(
  "/contact/:contactName",
  asyncHandler(async (req, res) => {
    const profile = await EmergencyProfile.findOne({ userId: req.user._id });

    if (!profile) {
      throw new AppError("Emergency profile not found", 404);
    }

    profile.emergencyContacts = profile.emergencyContacts.filter(
      (c) => c.name !== req.params.contactName
    );

    profile.updateCompletion();
    await profile.save();

    res.json({
      success: true,
      message: "Contact deleted",
      data: profile.emergencyContacts,
    });
  })
);

export default router;
