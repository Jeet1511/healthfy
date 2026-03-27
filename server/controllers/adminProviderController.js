import {
  activateProvider,
  createProvider,
  listProviders,
  setProviderEnabled,
} from "../services/aiProviderService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAdminProvider = asyncHandler(async (req, res) => {
  const { name, apiKey, model, temperature, isEnabled } = req.body;

  if (!name || !apiKey || !model) {
    throw new AppError("name, apiKey, and model are required", 400);
  }

  const normalizedTemperature = Number(temperature ?? 0.7);
  if (Number.isNaN(normalizedTemperature) || normalizedTemperature < 0 || normalizedTemperature > 2) {
    throw new AppError("temperature must be a number between 0 and 2", 400);
  }

  try {
    const provider = await createProvider({
      name: String(name).trim(),
      apiKey: String(apiKey),
      model: String(model).trim(),
      temperature: normalizedTemperature,
      isEnabled: isEnabled ?? true,
    });

    res.status(201).json({
      status: "success",
      data: provider,
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      throw new AppError(error.message, 409);
    }

    throw error;
  }
});

export const getAdminProviders = asyncHandler(async (req, res) => {
  const providers = await listProviders();

  res.status(200).json({
    status: "success",
    data: providers,
  });
});

export const activateAdminProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.body;

  if (!providerId) {
    throw new AppError("providerId is required", 400);
  }

  const provider = await activateProvider(String(providerId));
  if (!provider) {
    throw new AppError("Provider not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: provider,
  });
});

export const toggleProviderEnabled = asyncHandler(async (req, res) => {
  const { providerId, isEnabled } = req.body;

  if (!providerId || typeof isEnabled !== "boolean") {
    throw new AppError("providerId and boolean isEnabled are required", 400);
  }

  const provider = await setProviderEnabled(String(providerId), isEnabled);
  if (!provider) {
    throw new AppError("Provider not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: provider,
  });
});
