import { Router } from "express";
import { addActivity, login, me, profile, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.get("/profile", authMiddleware, profile);
router.post("/activity", authMiddleware, addActivity);

export default router;
