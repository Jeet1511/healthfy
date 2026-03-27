import { AppError } from "../utils/AppError.js";

export function adminMiddleware(req, res, next) {
  if (!req.user) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  if (req.user.role !== "admin") {
    next(new AppError("Admin access required", 403));
    return;
  }

  next();
}
