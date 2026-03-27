import { Router } from "express";
import { adminOverview } from "../controllers/adminController.js";
import {
	activateAdminProvider,
	createAdminProvider,
	getAdminProviders,
	toggleProviderEnabled,
} from "../controllers/adminProviderController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", adminOverview);
router.post("/provider", createAdminProvider);
router.get("/providers", getAdminProviders);
router.post("/activate", activateAdminProvider);
router.post("/toggle-enabled", toggleProviderEnabled);

export default router;
