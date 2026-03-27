import { Router } from "express";
import aiRoutes from "./aiRoutes.js";
import adminRoutes from "./adminRoutes.js";
import assistanceRoutes from "./assistanceRoutes.js";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";
import resourcesRoutes from "./resourcesRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/ai", aiRoutes);
router.use("/auth", authRoutes);
router.use("/assistance", assistanceRoutes);
router.use("/resources", resourcesRoutes);
router.use("/admin", adminRoutes);

export default router;
