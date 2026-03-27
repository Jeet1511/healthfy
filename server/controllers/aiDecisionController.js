import { decisionEngine } from "../services/aiGatewayService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const decisionEngineController = asyncHandler(async (req, res) => {
  const input = req.body?.input ?? req.body?.text ?? req.body?.message;

  if (!input || typeof input !== "string" || !input.trim()) {
    throw new AppError("input is required", 400);
  }

  const result = await decisionEngine(input.trim());

  res.status(200).json({
    ...result.response,
    ...(result.reason ? { note: result.reason } : {}),
  });
});
