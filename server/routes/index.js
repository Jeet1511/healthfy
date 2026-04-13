import { Router } from "express";
import aiRoutes from "./aiRoutes.js";
import adminRoutes from "./adminRoutes.js";
import assistanceRoutes from "./assistanceRoutes.js";
import authRoutes from "./authRoutes.js";
import evidenceRoutes from "./evidenceRoutes.js";
import healthRoutes from "./healthRoutes.js";
import resourcesRoutes from "./resourcesRoutes.js";
import sosRoutes from "./sosRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/ai", aiRoutes);
router.use("/auth", authRoutes);
router.use("/", uploadRoutes);
router.use("/assistance", assistanceRoutes);
router.use("/evidence", evidenceRoutes);
router.use("/resources", resourcesRoutes);
router.use("/sos", sosRoutes);
router.use("/admin", adminRoutes);

export default router;
