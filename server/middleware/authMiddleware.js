import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserById } from "../services/userService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authorization token missing", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("Authorization token missing", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await findUserById(decoded.sub);
  if (!user) {
    throw new AppError("User not found for this token", 401);
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  next();
});
