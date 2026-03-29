import { Router } from "express";
import { adminOverview } from "../controllers/adminController.js";
import {
  activateAdminProvider,
  createAdminProvider,
  getAdminProviders,
  toggleProviderEnabled,
  deleteAdminProvider,
} from "../controllers/adminProviderController.js";
import {
  listUsers,
  deleteUser,
  getAdminStats,
} from "../controllers/adminUserController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/", adminOverview);
router.get("/stats", getAdminStats);

// Users
router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);

// AI Providers
router.post("/provider", createAdminProvider);
router.get("/providers", getAdminProviders);
router.post("/activate", activateAdminProvider);
router.post("/toggle-enabled", toggleProviderEnabled);
router.delete("/provider/:id", deleteAdminProvider);

export default router;
