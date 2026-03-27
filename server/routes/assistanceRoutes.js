import { Router } from "express";
import { createRequest, listRequests } from "../controllers/assistanceController.js";

const router = Router();

router.get("/", listRequests);
router.post("/", createRequest);

export default router;
