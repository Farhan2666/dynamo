import type { LLMProvider } from "@/types";
import { DEFAULT_MODEL } from "@/lib/llm/models";

export interface LLMRequest {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: "json" | "text";
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: { input: number; output: number };
}

export async function callLLM(params: LLMRequest): Promise<LLMResponse> {
  const model = params.model || DEFAULT_MODEL[params.provider];

  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: params.provider,
      apiKey: params.apiKey,
      model,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
      responseFormat: params.responseFormat,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `LLM proxy error (${res.status})`);
  }

  return res.json();
}
