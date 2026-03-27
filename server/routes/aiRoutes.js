import { Router } from "express";
import { decisionEngineController } from "../controllers/aiDecisionController.js";

const router = Router();

router.post("/decision-engine", decisionEngineController);

export default router;
