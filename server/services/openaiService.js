export async function openaiService({
  apiKey,
  model,
  temperature,
  prompt,
  providerType = "openai",
  systemPrompt,
  responseFormat = { type: "json_object" },
}) {
  const isOpenRouter = providerType === "openrouter";
  const endpoint = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const defaultSystemPrompt =
    "You are a human assistance decision engine. Return strict JSON with keys: status, category, actions, instructions.";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter ? { "HTTP-Referer": "http://localhost:5173", "X-Title": "OMINA" } : {}),
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
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
