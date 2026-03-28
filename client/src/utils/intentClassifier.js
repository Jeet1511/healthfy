const EMERGENCY_KEYWORDS = [
  "help",
  "attack",
  "following me",
  "unsafe",
  "danger",
  "harass",
  "fire",
  "bleeding",
  "accident",
  "unconscious",
  "panic",
  "stuck",
  "trapped",
  "emergency",
  "kidnap",
  "threat",
  "assault",
  "someone is following",
  "not safe",
];

export function detectIntent(query) {
  const normalized = String(query || "").toLowerCase().trim();
  if (!normalized) {
    return { mode: "daily", urgency: "normal", confidence: 0 };
  }

  const matched = EMERGENCY_KEYWORDS.filter((keyword) => normalized.includes(keyword));
  const emergencyScore = matched.length;

  if (emergencyScore >= 2) {
    return { mode: "emergency", urgency: "high", confidence: 0.95, matched };
  }
  if (emergencyScore === 1) {
    return { mode: "emergency", urgency: "medium", confidence: 0.72, matched };
  }

  return { mode: "daily", urgency: "normal", confidence: 0.88, matched: [] };
}
