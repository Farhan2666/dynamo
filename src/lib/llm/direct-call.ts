import type { LLMResponse } from "./api-call";
import type { LLMProvider } from "@/types";
import { DEFAULT_MODEL } from "@/lib/llm/models";

const API_BASES: Record<LLMProvider, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  mistral: "https://api.mistral.ai/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  cohere: "https://api.cohere.ai/v1",
  together: "https://api.together.xyz/v1",
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

export async function callLLMService(
  provider: LLMProvider,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string,
  responseFormat?: "json" | "text"
): Promise<LLMResponse> {
  const resolvedModel = model || DEFAULT_MODEL[provider] || "gpt-4o-mini";

  if (provider === "anthropic") {
    return directAnthropic(apiKey, resolvedModel, systemPrompt, userPrompt);
  }

  return directOpenAICompatible(provider, apiKey, resolvedModel, systemPrompt, userPrompt, responseFormat);
}

async function directOpenAICompatible(
  provider: LLMProvider,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  responseFormat?: "json" | "text"
): Promise<LLMResponse> {
  const baseUrl = API_BASES[provider];
  const supportsJsonMode = provider === "openai" || provider === "openrouter";

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4096,
  };

  if (responseFormat === "json" && supportsJsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    usage: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
    },
  };
}

async function directAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const res = await fetch(`${API_BASES.anthropic}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    content: data.content?.[0]?.text || "",
    model: data.model || model,
    usage: { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0 },
  };
}
