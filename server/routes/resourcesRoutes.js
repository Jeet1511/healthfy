import { Router } from "express";
import { listResources } from "../controllers/resourcesController.js";

const router = Router();

router.get("/", listResources);

export default router;
