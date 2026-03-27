import { getActiveProviderCredentials } from "./aiProviderService.js";
import {
  keywordFallback,
  safeParseAndNormalizeAiOutput,
} from "./decisionFallbackService.js";
import { openaiService } from "./openaiService.js";
import { anthropicService } from "./anthropicService.js";
import { groqService } from "./groqService.js";

function buildPrompt(input) {
  return [
    "Analyze the following user situation.",
    "Return ONLY valid JSON.",
    "Do not add paragraph text or markdown.",
    "Required keys:",
    "status (CRITICAL|MODERATE|SAFE),",
    "category (safety|medical|disaster),",
    "actions (array of objects: { type: call|navigate|alert, label: string, priority: number }),",
    "instructions (string array).",
    "Input:",
    input,
  ].join("\n");
}

async function callAdapter(provider, prompt) {
  const payload = {
    apiKey: provider.apiKey,
    model: provider.model,
    temperature: provider.temperature,
    prompt,
  };

  if (provider.providerType === "anthropic") {
    return anthropicService(payload);
  }

  if (provider.providerType === "groq") {
    return groqService(payload);
  }

  return openaiService(payload);
}

export async function decisionEngine(input) {
  const fallback = keywordFallback(input);

  try {
    const provider = await getActiveProviderCredentials();
    if (!provider) {
      return {
        response: fallback,
        reason: "No active AI provider",
      };
    }

    const prompt = buildPrompt(input);
    const aiText = await callAdapter(provider, prompt);
    const normalized = safeParseAndNormalizeAiOutput(aiText);

    return {
      response: normalized,
    };
  } catch {
    return {
      response: fallback,
      reason: "Provider call failed",
    };
  }
}
