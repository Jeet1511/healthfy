import { getActiveProviderCredentials } from "./aiProviderService.js";
import { env } from "../config/env.js";
import {
  keywordFallback,
  normalizeDecisionResponse,
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

function buildChatPrompt(input) {
  return [
    "User message:",
    input,
    "",
    "Return ONLY valid JSON with keys:",
    "reply (string, empathetic and natural),",
    "status (CRITICAL|MODERATE|SAFE),",
    "category (safety|medical|disaster|general),",
    "instructions (string array, max 3 concise items).",
    "Keep reply concise: for normal/safe chat use max 1-2 short sentences.",
    "Use longer guidance only when status is CRITICAL or MODERATE.",
  ].join("\n");
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    throw new Error("AI response text is empty");
  }

  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("No JSON block found in AI output");
    }
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  }
}

function isGreeting(text) {
  const value = String(text || "").trim().toLowerCase();
  return (
    value === "hi" ||
    value === "hii" ||
    value === "hello" ||
    value === "hey" ||
    value === "yo" ||
    value.startsWith("good morning") ||
    value.startsWith("good afternoon") ||
    value.startsWith("good evening")
  );
}

function isIdentityQuestion(text) {
  const value = String(text || "").trim().toLowerCase();
  return (
    value.includes("who are you") ||
    value.includes("what are you") ||
    value.includes("your name")
  );
}

function isCapabilityQuestion(text) {
  const value = String(text || "").trim().toLowerCase();
  return (
    value.includes("what can you do") ||
    value.includes("how can you help") ||
    value.includes("help me with")
  );
}

function isThanksMessage(text) {
  const value = String(text || "").trim().toLowerCase();
  return value === "thanks" || value === "thank you" || value.includes("thanks ");
}

function buildOfflineReply(input, fallback) {
  if (isIdentityQuestion(input)) {
    return {
      reply:
        "I’m OMINA. I help with everyday questions and emergency safety guidance.",
      status: "SAFE",
      category: "general",
      instructions: ["Tell me what you need right now."],
    };
  }

  if (isCapabilityQuestion(input)) {
    return {
      reply:
        "I can help with normal support and urgent safety situations.",
      status: "SAFE",
      category: "general",
      instructions: ["Share your situation in one line."],
    };
  }

  if (isThanksMessage(input)) {
    return {
      reply: "You’re welcome — I’m here anytime you need help.",
      status: "SAFE",
      category: "general",
      instructions: ["If anything changes, message me and I’ll adapt quickly."],
    };
  }

  if (isGreeting(input)) {
    return {
      reply:
        "Hey 👋 I’m OMINA. How can I help you today?",
      status: "SAFE",
      category: "general",
      instructions: ["Share a bit more detail."],
    };
  }

  if (fallback.status === "CRITICAL" || fallback.status === "MODERATE") {
    return {
      reply:
        "This sounds risky. I’m switching you to emergency guidance now. Focus on immediate safety first, then share your location if you can.",
      status: fallback.status,
      category: fallback.category,
      instructions: (fallback.instructions || []).slice(0, 3),
    };
  }

  return {
    reply:
      "Got it. Tell me your goal, and I’ll help quickly.",
    status: "SAFE",
    category: "general",
    instructions: ["Add context if needed (location or urgency)."],
  };
}

async function callAdapter(provider, prompt) {
  const payload = {
    apiKey: provider.apiKey,
    model: provider.model,
    temperature: provider.temperature,
    providerType: provider.providerType,
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

async function callAssistantAdapter(provider, prompt) {
  const payload = {
    apiKey: provider.apiKey,
    model: provider.model,
    temperature: provider.temperature,
    providerType: provider.providerType,
    prompt,
    systemPrompt:
      "You are OMINA, a calm and empathetic human-assistance AI. Think carefully about danger, avoid robotic wording, and keep normal chat replies very short (1-2 sentences). Return strict JSON only.",
    responseFormat: { type: "json_object" },
  };

  if (provider.providerType === "anthropic") {
    return anthropicService(payload);
  }

  if (provider.providerType === "groq") {
    return groqService(payload);
  }

  return openaiService(payload);
}

async function callAdapterWithTimeout(provider, prompt) {
  const timeoutMs = Number.isFinite(env.aiTimeoutMs) && env.aiTimeoutMs > 0 ? env.aiTimeoutMs : 7000;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Provider call timed out"));
    }, timeoutMs);
  });

  return Promise.race([callAdapter(provider, prompt), timeoutPromise]);
}

async function callAssistantAdapterWithTimeout(provider, prompt) {
  const timeoutMs = Number.isFinite(env.aiTimeoutMs) && env.aiTimeoutMs > 0 ? env.aiTimeoutMs : 7000;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Provider call timed out"));
    }, timeoutMs);
  });

  return Promise.race([callAssistantAdapter(provider, prompt), timeoutPromise]);
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
  const aiText = await callAdapterWithTimeout(provider, prompt);
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

export async function assistantChat(input) {
  const fallback = keywordFallback(input);

  try {
    const provider = await getActiveProviderCredentials();
    if (!provider) {
      return {
        response: buildOfflineReply(input, fallback),
        reason: "No active AI provider",
      };
    }

    const prompt = buildChatPrompt(input);
    const aiText = await callAssistantAdapterWithTimeout(provider, prompt);
    const parsed = extractJsonObject(aiText);
    const normalized = normalizeDecisionResponse(parsed);
    const reply = String(parsed?.reply || "").trim();

    return {
      response: {
        reply:
          reply ||
          (normalized.status === "SAFE"
            ? "I understand. Tell me a little more and I’ll help you with the next step."
            : "I detected possible danger. I’m prioritizing emergency guidance now."),
        status: normalized.status,
        category: normalized.category,
        instructions: normalized.instructions,
      },
    };
  } catch {
    return {
      response: buildOfflineReply(input, fallback),
      reason: "Provider call failed",
    };
  }
}
