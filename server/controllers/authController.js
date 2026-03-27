import { env } from "../config/env.js";
import { signAuthToken } from "../services/authService.js";
import {
  addUserActivityLog,
  addUserEmergencyLog,
  addUserSearchLog,
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
} from "../services/userService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password, role, adminSetupKey } = req.body;

  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("User with this email already exists", 409);
  }

  let finalRole = "user";
  if (role === "admin") {
    if (!env.adminSetupKey || adminSetupKey !== env.adminSetupKey) {
      throw new AppError("Invalid admin setup key", 403);
    }
    finalRole = "admin";
  }

  const user = await createUser({ email, password, role: finalRole });
  const token = signAuthToken(user);

  res.status(201).json({
    status: "success",
    token,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const user = await findUserByEmail(email, { includePassword: true });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const validPassword = await verifyPassword(user, password);
  if (!validPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signAuthToken(user);

  res.status(200).json({
    status: "success",
    token,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      activityHistory: user.activityHistory || [],
      emergencyLogs: user.emergencyLogs || [],
      searchLogs: user.searchLogs || [],
    },
  });
});

export const addActivity = asyncHandler(async (req, res) => {
  const { type, payload } = req.body || {};

  if (!type || !payload || typeof payload !== "object") {
    throw new AppError("type and payload are required", 400);
  }

  let created = null;

  if (type === "activity") {
    created = await addUserActivityLog(req.user.id, payload);
  } else if (type === "emergency") {
    created = await addUserEmergencyLog(req.user.id, payload);
  } else if (type === "search") {
    created = await addUserSearchLog(req.user.id, payload);
  } else {
    throw new AppError("Invalid tracking type", 400);
  }

  res.status(200).json({
    status: "success",
    data: created,
  });
});
