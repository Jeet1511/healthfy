export async function groqService({
  apiKey,
  model,
  temperature,
  prompt,
  systemPrompt,
  responseFormat = { type: "json_object" },
}) {
  const defaultSystemPrompt =
    "You are a human assistance decision engine. Return strict JSON with keys: status, category, actions, instructions.";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content: systemPrompt || defaultSystemPrompt,
        },
        { role: "user", content: prompt },
      ],
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
