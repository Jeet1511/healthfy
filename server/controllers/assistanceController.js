import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createAssistanceRequest,
  getAssistanceRequests,
} from "../services/assistanceService.js";

export const listRequests = asyncHandler(async (req, res) => {
  const requests = await getAssistanceRequests();
  res.status(200).json({ status: "success", data: requests });
});

export const createRequest = asyncHandler(async (req, res) => {
  const { name, email, category, message } = req.body;

  if (!name || !email || !category || !message) {
    throw new AppError("name, email, category, and message are required", 400);
  }

  const request = await createAssistanceRequest({ name, email, category, message });
  res.status(201).json({ status: "success", data: request });
});
