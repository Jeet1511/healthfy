export async function groqService({ apiKey, model, temperature, prompt }) {
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
          content:
            "You are a human assistance decision engine. Return strict JSON with keys: status, category, actions, instructions.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
