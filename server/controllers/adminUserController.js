import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ status: "success", data: [] });
  }

  const users = await User.find()
    .select("email role createdAt activityHistory emergencyLogs searchLogs")
    .sort({ createdAt: -1 })
    .lean();

  const mapped = users.map((u) => ({
    id: u._id.toString(),
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    activityCount: (u.activityHistory || []).length,
    emergencyCount: (u.emergencyLogs || []).length,
    searchCount: (u.searchLogs || []).length,
  }));

  res.json({ status: "success", data: mapped });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState !== 1) {
    throw new AppError("Database not connected", 500);
  }

  if (id === req.user.id) {
    throw new AppError("Cannot delete yourself", 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ status: "success", message: "User deleted" });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      status: "success",
      data: { totalUsers: 0, totalAdmins: 0, totalRequests: 0, dbStatus: "disconnected" },
    });
  }

  const [totalUsers, totalAdmins] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
  ]);

  const recentUsers = await User.find()
    .select("email role createdAt")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json({
    status: "success",
    data: {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      dbStatus: "connected",
      recentUsers: recentUsers.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    },
  });
});
