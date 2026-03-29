import { Router } from "express";
import { adminOverview } from "../controllers/adminController.js";
import {
	activateAdminProvider,
	createAdminProvider,
	deleteAdminProvider,
	getAdminProviders,
	toggleProviderEnabled,
} from "../controllers/adminProviderController.js";
import {
	deleteUser,
	getAdminStats,
	listUsers,
} from "../controllers/adminUserController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", adminOverview);
router.get("/stats", getAdminStats);
router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);
router.post("/provider", createAdminProvider);
router.get("/providers", getAdminProviders);
router.post("/activate", activateAdminProvider);
router.post("/toggle-enabled", toggleProviderEnabled);
router.delete("/provider/:id", deleteAdminProvider);

export default router;
