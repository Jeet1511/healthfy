export async function anthropicService({
  apiKey,
  model,
  temperature,
  prompt,
  systemPrompt,
}) {
  const defaultSystemPrompt =
    "You are a human assistance decision engine. Return strict JSON with keys: status, category, actions, instructions.";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      temperature,
      system: systemPrompt || defaultSystemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = Array.isArray(data?.content) ? data.content : [];
  const textPart = content.find((item) => item?.type === "text");
  return textPart?.text || "";
}
