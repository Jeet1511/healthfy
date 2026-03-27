import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const inMemoryUsers = [];

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    activityHistory: user.activityHistory || [],
    emergencyLogs: user.emergencyLogs || [],
    searchLogs: user.searchLogs || [],
  };
}

export async function findUserByEmail(email, { includePassword = false } = {}) {
  if (mongoose.connection.readyState === 1) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select("+password");
    }

    const user = await query;
    if (!user) return null;

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      passwordHash: includePassword ? user.password : undefined,
      createdAt: user.createdAt,
      activityHistory: user.activityHistory || [],
      emergencyLogs: user.emergencyLogs || [],
      searchLogs: user.searchLogs || [],
      source: "db",
      model: user,
    };

    return payload;
  }

  const found = inMemoryUsers.find((item) => item.email === email.toLowerCase());
  if (!found) return null;

  return {
    ...found,
    source: "memory",
    passwordHash: includePassword ? found.passwordHash : undefined,
  };
}

export async function createUser({ email, password, role }) {
  if (mongoose.connection.readyState === 1) {
    const user = await User.create({ email, password, role });
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      source: "db",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const createdAt = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    role,
    passwordHash,
    createdAt,
    activityHistory: [],
    emergencyLogs: [],
    searchLogs: [],
  };

  inMemoryUsers.push(user);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    source: "memory",
  };
}

export async function verifyPassword(user, plainPassword) {
  if (user.source === "db" && user.model) {
    return user.model.comparePassword(plainPassword);
  }

  return bcrypt.compare(plainPassword, user.passwordHash);
}

export async function findUserById(id) {
  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(id);
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      activityHistory: user.activityHistory || [],
      emergencyLogs: user.emergencyLogs || [],
      searchLogs: user.searchLogs || [],
      source: "db",
    };
  }

  const user = inMemoryUsers.find((item) => item.id === id);
  return user ? sanitizeUser(user) : null;
}

export async function addUserActivityLog(userId, payload) {
  const entry = {
    label: String(payload.label || "Action").slice(0, 200),
    category: payload.category || "general",
    createdAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    await User.updateOne({ _id: userId }, { $push: { activityHistory: entry } });
    return entry;
  }

  const user = inMemoryUsers.find((item) => item.id === userId);
  if (!user) return null;
  user.activityHistory = user.activityHistory || [];
  user.activityHistory.push(entry);
  return entry;
}

export async function addUserEmergencyLog(userId, payload) {
  const entry = {
    status: payload.status || "SAFE",
    category: payload.category || "safety",
    summary: String(payload.summary || "").slice(0, 300),
    createdAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    await User.updateOne({ _id: userId }, { $push: { emergencyLogs: entry } });
    return entry;
  }

  const user = inMemoryUsers.find((item) => item.id === userId);
  if (!user) return null;
  user.emergencyLogs = user.emergencyLogs || [];
  user.emergencyLogs.push(entry);
  return entry;
}

export async function addUserSearchLog(userId, payload) {
  const entry = {
    query: String(payload.query || "").slice(0, 200),
    type: payload.type || "all",
    createdAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    await User.updateOne({ _id: userId }, { $push: { searchLogs: entry } });
    return entry;
  }

  const user = inMemoryUsers.find((item) => item.id === userId);
  if (!user) return null;
  user.searchLogs = user.searchLogs || [];
  user.searchLogs.push(entry);
  return entry;
}

export async function getUserCounts() {
  if (mongoose.connection.readyState === 1) {
    const [totalUsers, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    return { totalUsers, totalAdmins };
  }

  const totalUsers = inMemoryUsers.length;
  const totalAdmins = inMemoryUsers.filter((item) => item.role === "admin").length;
  return { totalUsers, totalAdmins };
}
