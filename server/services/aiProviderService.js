import crypto from "node:crypto";
import mongoose from "mongoose";
import { AIProvider } from "../models/AIProvider.js";
import { decrypt, encrypt } from "../utils/crypto.js";

const inMemoryProviders = [];

function maskKey(rawKey) {
  const value = String(rawKey || "");
  if (value.length <= 8) {
    return "****";
  }

  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function inferProviderType({ name, model }) {
  const source = `${name || ""} ${model || ""}`.toLowerCase();

  if (source.includes("anthropic") || source.includes("claude")) {
    return "anthropic";
  }

  if (source.includes("groq") || source.includes("llama") || source.includes("mixtral")) {
    return "groq";
  }

  return "openai";
}

function mapProviderForResponse(provider) {
  let maskedApiKey = "****";
  try {
    maskedApiKey = maskKey(decrypt(provider.apiKeyEncrypted));
  } catch {
    maskedApiKey = "****";
  }

  return {
    id: provider.id,
    name: provider.name,
    model: provider.model,
    temperature: provider.temperature,
    isActive: provider.isActive,
    isEnabled: provider.isEnabled,
    maskedApiKey,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}

export async function createProvider({ name, apiKey, model, temperature, isEnabled }) {
  const apiKeyEncrypted = encrypt(apiKey);

  if (mongoose.connection.readyState === 1) {
    const existing = await AIProvider.findOne({ name: name.trim() });
    if (existing) {
      throw new Error("Provider with this name already exists");
    }

    const provider = await AIProvider.create({
      name,
      apiKeyEncrypted,
      model,
      temperature,
      isEnabled,
      isActive: false,
    });

    return mapProviderForResponse({
      id: provider._id.toString(),
      name: provider.name,
      apiKeyEncrypted,
      model: provider.model,
      temperature: provider.temperature,
      isActive: provider.isActive,
      isEnabled: provider.isEnabled,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    });
  }

  const existing = inMemoryProviders.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    throw new Error("Provider with this name already exists");
  }

  const now = new Date().toISOString();
  const provider = {
    id: crypto.randomUUID(),
    name,
    apiKeyEncrypted,
    model,
    temperature,
    isActive: false,
    isEnabled,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryProviders.push(provider);
  return mapProviderForResponse(provider);
}

export async function listProviders() {
  if (mongoose.connection.readyState === 1) {
    const providers = await AIProvider.find().select("+apiKeyEncrypted").sort({ createdAt: -1 });

    return providers.map((provider) =>
      mapProviderForResponse({
        id: provider._id.toString(),
        name: provider.name,
        apiKeyEncrypted: provider.apiKeyEncrypted,
        model: provider.model,
        temperature: provider.temperature,
        isActive: provider.isActive,
        isEnabled: provider.isEnabled,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      })
    );
  }

  return [...inMemoryProviders].reverse().map(mapProviderForResponse);
}

export async function activateProvider(providerId) {
  if (mongoose.connection.readyState === 1) {
    await AIProvider.updateMany({}, { isActive: false });
    const provider = await AIProvider.findById(providerId).select("+apiKeyEncrypted");
    if (!provider) {
      return null;
    }

    provider.isActive = true;
    await provider.save();

    return mapProviderForResponse({
      id: provider._id.toString(),
      name: provider.name,
      apiKeyEncrypted: provider.apiKeyEncrypted,
      model: provider.model,
      temperature: provider.temperature,
      isActive: provider.isActive,
      isEnabled: provider.isEnabled,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    });
  }

  const target = inMemoryProviders.find((item) => item.id === providerId);
  if (!target) {
    return null;
  }

  inMemoryProviders.forEach((item) => {
    item.isActive = false;
    item.updatedAt = new Date().toISOString();
  });
  target.isActive = true;
  target.updatedAt = new Date().toISOString();

  return mapProviderForResponse(target);
}

export async function getActiveProviderCredentials() {
  if (mongoose.connection.readyState === 1) {
    const provider = await AIProvider.findOne({ isActive: true, isEnabled: true }).select("+apiKeyEncrypted");
    if (!provider) {
      return null;
    }

    return {
      id: provider._id.toString(),
      name: provider.name,
      model: provider.model,
      temperature: provider.temperature,
      providerType: inferProviderType({ name: provider.name, model: provider.model }),
      apiKey: decrypt(provider.apiKeyEncrypted),
    };
  }

  const provider = inMemoryProviders.find((item) => item.isActive && item.isEnabled);
  if (!provider) {
    return null;
  }

  return {
    id: provider.id,
    name: provider.name,
    model: provider.model,
    temperature: provider.temperature,
    providerType: inferProviderType({ name: provider.name, model: provider.model }),
    apiKey: decrypt(provider.apiKeyEncrypted),
  };
}

export async function setProviderEnabled(providerId, isEnabled) {
  if (mongoose.connection.readyState === 1) {
    const provider = await AIProvider.findById(providerId).select("+apiKeyEncrypted");
    if (!provider) {
      return null;
    }

    provider.isEnabled = Boolean(isEnabled);
    if (!provider.isEnabled && provider.isActive) {
      provider.isActive = false;
    }

    await provider.save();

    return mapProviderForResponse({
      id: provider._id.toString(),
      name: provider.name,
      apiKeyEncrypted: provider.apiKeyEncrypted,
      model: provider.model,
      temperature: provider.temperature,
      isActive: provider.isActive,
      isEnabled: provider.isEnabled,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    });
  }

  const target = inMemoryProviders.find((item) => item.id === providerId);
  if (!target) {
    return null;
  }

  target.isEnabled = Boolean(isEnabled);
  if (!target.isEnabled && target.isActive) {
    target.isActive = false;
  }
  target.updatedAt = new Date().toISOString();

  return mapProviderForResponse(target);
}
