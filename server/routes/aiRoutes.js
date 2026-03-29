import { Router } from "express";
import {
	assistantChatController,
	decisionEngineController,
} from "../controllers/aiDecisionController.js";

const router = Router();

router.post("/decision-engine", decisionEngineController);
router.post("/assistant-chat", assistantChatController);

export default router;
