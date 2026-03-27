import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  buildEmergencyUserPrompt,
  SYMPTOM_ANALYSIS_SYSTEM_PROMPT,
} from "@/backend/lib/aiPrompts";
import { EmergencyResponse } from "@/backend/types";

function heuristicFallback(input: string): EmergencyResponse {
  const text = input.toLowerCase();
  const criticalKeywords = [
    "chest pain",
    "not breathing",
    "unconscious",
    "seizure",
    "heavy bleeding",
    "stroke",
    "heart attack",
  ];
  const mediumKeywords = [
    "high fever",
    "vomiting",
    "fracture",
    "breathless",
    "accident",
    "burn",
  ];

  const isCritical = criticalKeywords.some((item) => text.includes(item));
  const isMedium = mediumKeywords.some((item) => text.includes(item));

  if (isCritical) {
    return {
      urgency: "Critical",
      message: "Possible emergency detected. Immediate medical help is strongly recommended.",
      steps: [
        "Call ambulance right now and share your exact location.",
        "Keep the person lying down and monitor breathing continuously.",
        "If trained, begin CPR/first aid while waiting for responders.",
      ],
      actions: ["Call Ambulance", "Find Hospital", "Notify Police"],
    };
  }

  if (isMedium) {
    return {
      urgency: "Moderate",
      message:
        "This may require urgent care. Monitor closely and reach a nearby hospital soon.",
      steps: [
        "Move the person to a safe, calm area.",
        "Track pain, breathing, and alertness for the next few minutes.",
        "Arrange transport to nearest hospital within 30-60 minutes.",
      ],
      actions: ["Find Hospital", "Need Blood"],
    };
  }

  return {
    urgency: "Safe",
    message:
      "No immediate high-risk signal found. Continue monitoring and seek care if symptoms persist.",
    steps: [
      "Stay hydrated and rest in a safe environment.",
      "Track symptoms for the next 2-4 hours.",
      "Consult a nearby clinic if discomfort continues.",
    ],
    actions: ["Find Hospital"],
  };
}

function normalizeResponse(value: unknown): EmergencyResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<EmergencyResponse>;
  if (!candidate.urgency || !candidate.message) {
    return null;
  }

  const urgencyMap: Record<string, EmergencyResponse["urgency"]> = {
    critical: "Critical",
    moderate: "Moderate",
    medium: "Moderate",
    safe: "Safe",
    low: "Safe",
  };

  const normalizedUrgency = urgencyMap[String(candidate.urgency).toLowerCase()] ?? "Moderate";
  const steps = Array.isArray(candidate.steps)
    ? candidate.steps.filter((step): step is string => typeof step === "string").slice(0, 4)
    : ["Stay calm and follow emergency instructions."];
  const actions = Array.isArray(candidate.actions)
    ? candidate.actions.filter((action): action is string => typeof action === "string").slice(0, 3)
    : ["Find Hospital"];

  return {
    urgency: normalizedUrgency,
    message: String(candidate.message),
    steps,
    actions,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = body.input?.trim();

    if (!input) {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ result: heuristicFallback(input), mode: "mock" });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYMPTOM_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildEmergencyUserPrompt(input) },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ result: heuristicFallback(input), mode: "mock" });
    }

    const parsed = normalizeResponse(JSON.parse(content));
    if (!parsed) {
      return NextResponse.json({ result: heuristicFallback(input), mode: "mock" });
    }

    return NextResponse.json({ result: parsed, mode: "ai" });
  } catch {
    return NextResponse.json(
      { result: heuristicFallback(""), mode: "mock" },
      { status: 200 },
    );
  }
}
