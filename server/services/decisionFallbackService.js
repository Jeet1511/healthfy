function normalizeStatus(value) {
  const raw = String(value || "").toUpperCase();
  if (["CRITICAL", "HIGH"].includes(raw)) return "CRITICAL";
  if (["MODERATE", "MEDIUM"].includes(raw)) return "MODERATE";
  return "SAFE";
}

function normalizeCategory(value) {
  const raw = String(value || "").toLowerCase();
  if (["medical", "safety", "disaster"].includes(raw)) return raw;
  return "safety";
}

function normalizeList(values, defaultValues) {
  if (!Array.isArray(values)) return defaultValues;
  const clean = values.filter((item) => typeof item === "string" && item.trim()).slice(0, 6);
  return clean.length ? clean : defaultValues;
}

function normalizeActions(values, defaultValues) {
  if (!Array.isArray(values)) return defaultValues;

  const normalized = values
    .map((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return {
          type: "alert",
          label: item.trim(),
          priority: index + 1,
        };
      }

      if (!item || typeof item !== "object") return null;

      const rawType = String(item.type || "alert").toLowerCase();
      const type = ["call", "navigate", "alert"].includes(rawType) ? rawType : "alert";
      const label = String(item.label || "").trim();
      if (!label) return null;

      const rawPriority = Number(item.priority ?? index + 1);
      const priority = Number.isFinite(rawPriority) && rawPriority > 0 ? Math.floor(rawPriority) : index + 1;

      return { type, label, priority };
    })
    .filter(Boolean)
    .slice(0, 6);

  return normalized.length ? normalized : defaultValues;
}

export function normalizeDecisionResponse(payload) {
  const status = normalizeStatus(payload?.status);
  const category = normalizeCategory(payload?.category);

  const actions = normalizeActions(payload?.actions, [
    { type: "alert", label: "Contact local emergency services if risk increases.", priority: 1 },
  ]);

  const instructions = normalizeList(payload?.instructions, [
    "Stay calm and monitor the situation closely.",
  ]);

  return { status, category, actions, instructions };
}

const keywordGroups = {
  safetyCritical: ["follow", "unsafe", "stalk"],
  medicalCritical: ["chest pain", "bleeding"],
  disasterCritical: ["earthquake", "flood"],
  moderate: ["fever", "vomiting", "burn", "panic", "accident", "injury"],
};

function includesAny(text, keywords) {
  return keywords.some((item) => text.includes(item));
}

export function detectCategory(input) {
  const text = String(input || "").toLowerCase();

  if (includesAny(text, keywordGroups.disasterCritical)) {
    return "disaster";
  }

  if (includesAny(text, keywordGroups.medicalCritical)) {
    return "medical";
  }

  if (includesAny(text, keywordGroups.safetyCritical)) {
    return "safety";
  }

  if (includesAny(text, keywordGroups.moderate)) {
    return "safety";
  }

  return "safety";
}

export function classifyUrgency(input) {
  const text = String(input || "").toLowerCase();

  if (
    includesAny(text, keywordGroups.safetyCritical) ||
    includesAny(text, keywordGroups.medicalCritical) ||
    includesAny(text, keywordGroups.disasterCritical)
  ) {
    return "CRITICAL";
  }

  if (includesAny(text, keywordGroups.moderate)) {
    return "MODERATE";
  }

  return "SAFE";
}

export function generateActions({ status, category }) {
  if (status === "CRITICAL" && category === "medical") {
    return [
      { type: "call", label: "Call Ambulance", priority: 1 },
      { type: "alert", label: "Share symptoms and exact location", priority: 2 },
      { type: "alert", label: "Keep patient stable and monitor breathing", priority: 3 },
    ];
  }

  if (status === "CRITICAL" && category === "disaster") {
    return [
      { type: "navigate", label: "Navigate to nearest safe zone", priority: 1 },
      { type: "call", label: "Alert authorities and nearby people", priority: 2 },
      { type: "alert", label: "Avoid unstable structures and hazard routes", priority: 3 },
    ];
  }

  if (status === "CRITICAL" && category === "safety") {
    return [
      { type: "navigate", label: "Move to secure public location", priority: 1 },
      { type: "call", label: "Call Police", priority: 2 },
      { type: "alert", label: "Share live location with trusted contacts", priority: 3 },
    ];
  }

  if (status === "MODERATE") {
    return [
      { type: "alert", label: "Reduce immediate risk in your surroundings", priority: 1 },
      { type: "call", label: "Contact support if situation escalates", priority: 2 },
    ];
  }

  return [
    { type: "alert", label: "Continue monitoring the situation", priority: 1 },
    { type: "call", label: "Escalate to emergency services if risk increases", priority: 2 },
  ];
}

export function generateInstructions({ status, category }) {
  if (status === "CRITICAL" && category === "medical") {
    return [
      "Do not delay emergency care.",
      "Follow dispatcher instructions until responders arrive.",
    ];
  }

  if (status === "CRITICAL" && category === "disaster") {
    return [
      "Prioritize evacuation and avoid hazard zones.",
      "Follow official disaster advisories.",
    ];
  }

  if (status === "CRITICAL" && category === "safety") {
    return [
      "Stay visible and avoid isolated areas.",
      "Keep emergency communication active.",
    ];
  }

  if (status === "MODERATE") {
    return [
      "Observe changes for the next hour.",
      "Prepare to escalate if condition worsens.",
    ];
  }

  return [
    "Keep emergency contacts available.",
    "Document important details for quick escalation.",
  ];
}

export function keywordFallback(input) {
  const status = classifyUrgency(input);
  const category = detectCategory(input);
  const actions = generateActions({ status, category });
  const instructions = generateInstructions({ status, category });

  return { status, category, actions, instructions };
}

export function parseAndNormalizeAiOutput(rawText) {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new Error("AI response text is empty");
  }

  const direct = JSON.parse(text);
  return normalizeDecisionResponse(direct);
}

export function safeParseAndNormalizeAiOutput(rawText) {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new Error("AI response text is empty");
  }

  try {
    return parseAndNormalizeAiOutput(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("No JSON block found in AI output");
    }

    const jsonSegment = text.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonSegment);
    return normalizeDecisionResponse(parsed);
  }
}
