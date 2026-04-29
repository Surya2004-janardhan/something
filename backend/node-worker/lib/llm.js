const fetch = globalThis.fetch || require("node-fetch");

async function openAiCompatible(url, apiKey, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey ? `Bearer ${apiKey}` : "",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function anthropicRequest(apiKey, body) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function googleRequest(apiKey, model, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey || ""}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function ollamaRequest(baseUrl, body) {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: false }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = {
  async runCompletion({ provider, model, messages, temperature, maxTokens }) {
    // simple compatible implementation supporting OpenAI-compatible, Anthropic, Google and Ollama
    const system = messages.find((m) => m.role === "system")?.content;

    if (provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const data = await anthropicRequest(apiKey, {
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: messages.filter((m) => m.role !== "system"),
      });
      const text = Array.isArray(data.content)
        ? data.content[0]?.text
        : data.content?.text;
      return { text: text || "", usage: {} };
    }

    if (provider === "google") {
      const apiKey = process.env.GOOGLE_API_KEY;
      const contents = [
        ...(system ? [{ role: "user", parts: [{ text: system }] }] : []),
        ...messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
      ];
      const data = await googleRequest(apiKey, model, {
        contents,
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return { text: text || "", usage: {} };
    }

    if (provider === "ollama") {
      const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      const data = await ollamaRequest(baseUrl, {
        model,
        messages,
        options: { temperature, num_predict: maxTokens },
      });
      return { text: data.message?.content || "", usage: {} };
    }

    // default: OpenAI-compatible
    const baseUrl =
      process.env.CUSTOM_LLM_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.OPENAI_API_KEY;
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const payload = { model, messages, temperature, max_tokens: maxTokens };
    const data = await openAiCompatible(url, apiKey, payload);
    const text = data.choices?.[0]?.message?.content || "";
    return {
      text: text || "",
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? null,
        completionTokens: data.usage?.completion_tokens ?? null,
        totalTokens: data.usage?.total_tokens ?? null,
      },
    };
  },
};
